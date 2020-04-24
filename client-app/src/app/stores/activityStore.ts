import { observable, action, computed, configure, runInAction } from "mobx";
import { createContext, SyntheticEvent } from "react";
import { IActivity } from "../models/activity";
import agent from "../api/agent";

configure({ enforceActions: "always" });

class ActivityStore {
  @observable activityRegistry = new Map<string, IActivity>();
  @observable loadingInitial = false;
  @observable activity: IActivity | null = null;
  @observable submitting = false;
  @observable target = "";
  @computed get activitiesByDate() {
    return Array.from(this.activityRegistry.values()).sort(
      (a, b) => Date.parse(a.date) - Date.parse(b.date)
    );
  }
  @action loadActivities = async () => {
    this.loadingInitial = true;
    try {
      const activities = await agent.Activities.list();
      runInAction("loading activities", () => {
        activities.forEach((a) => {
          a.date = a.date.split(".")[0];
          this.activityRegistry.set(a.id, a);
        });
      });
    } catch (error) {
      console.error(error);
    } finally {
      runInAction(() => (this.loadingInitial = false));
    }
  };
  @action loadActivity = async (id: string) => {
    let activity = this.getActivity(id);
    if (activity) {
      this.activity = activity;
    } else {
      await this.loadActivities();
      runInAction('gettin activity', () => {
        this.activity = this.getActivity(id);
      })
    }
  };
  @action clearActivity = () => {
    this.activity = null;
  }
  getActivity = (id: string) => {
    return this.activityRegistry.get(id) ?? null;
  };
  @action createActivity = async (activity: IActivity) => {
    this.submitting = true;
    try {
      await agent.Activities.create(activity);
      runInAction("creating activity", () => {
        this.activityRegistry.set(activity.id, activity);
        this.submitting = false;
      });
    } catch (error) {
      console.error(error);
    } finally {
      this.submitting = false;
    }
  };
  @action editActivity = async (activity: IActivity) => {
    this.submitting = true;
    try {
      await agent.Activities.update(activity);
      runInAction("editing activity", () => {
        this.activityRegistry.set(activity.id, activity);
        this.activity = activity;
      });
    } catch (error) {
      console.error(error);
    } finally {
      runInAction(() => {
        this.submitting = false;
      });
    }
  };
  @action deleteActivity = async (
    event: SyntheticEvent<HTMLButtonElement>,
    id: string
  ) => {
    this.submitting = true;
    this.target = event.currentTarget.name;
    try {
      await agent.Activities.delete(id);
      runInAction("delete activity", () => {
        this.activityRegistry.delete(id);
      });
    } catch (error) {
      console.error(error);
    } finally {
      runInAction(() => {
        this.submitting = false;
        this.target = "";
        this.activity = null;
      });
    }
  };
  @action openCreateForm = () => {
    this.activity = null;
  };
  @action openEditForm = (id: string) => {
    this.activity = this.getActivity(id);
  };
}

export default createContext(new ActivityStore());
