import { observable, action, computed, configure, runInAction } from "mobx";
import { createContext, SyntheticEvent } from "react";
import { IActivity } from "../models/activity";
import agent from "../api/agent";

configure({ enforceActions: "always" });

class ActivityStore {
  @observable activityRegistry = new Map<string, IActivity>();
  @observable activities: IActivity[] = [];
  @observable editMode = false;
  @observable loadingInitial = false;
  @observable selectedActivity: IActivity | undefined;
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
  @action createActivity = async (activity: IActivity) => {
    this.submitting = true;
    try {
      await agent.Activities.create(activity);
      runInAction("creating activity", () => {
        this.activityRegistry.set(activity.id, activity);
        this.editMode = false;
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
        this.selectedActivity = activity;
      });
    } catch (error) {
      console.error(error);
    } finally {
      runInAction(() => {
        this.editMode = false;
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
        this.selectedActivity = undefined;
      });
    }
  };
  @action openCreateForm = () => {
    this.editMode = true;
    this.selectedActivity = undefined;
  };
  @action openEditForm = (id: string) => {
    this.selectedActivity = this.activityRegistry.get(id);
    this.editMode = true;
  };
  @action cancelFormOpen = () => {
    this.editMode = false;
  };
  @action cancelSelectedActivity = () => {
    this.selectedActivity = undefined;
  };
  @action selectActivity(id: string) {
    this.selectedActivity = this.activityRegistry.get(id);
    this.editMode = false;
  }
}

export default createContext(new ActivityStore());
