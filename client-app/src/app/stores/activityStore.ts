import { observable, action, computed, runInAction } from "mobx";
import { SyntheticEvent } from "react";
import { IActivity } from "../models/activity";
import agent from "../api/agent";
import { history } from "../..";
import { toast } from "react-toastify";
import { RootStore } from "./rootStore";
import { setActivityProps, createAttendee } from "../common/util/util";

export default class ActivityStore {
  rootStore: RootStore;
  /**
   * Activity Store
   */
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
  }
  @observable activityRegistry = new Map<string, IActivity>();
  @observable loadingInitial = false;
  @observable loading = false;
  @observable activity: IActivity | null = null;
  @observable submitting = false;
  @observable target = "";
  @computed get activitiesByDate() {
    return this.groupActivitiesByDate(
      Array.from(this.activityRegistry.values())
    );
  }
  groupActivitiesByDate(activities: IActivity[]) {
    const sortedActivities = activities.sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
    return Object.entries(
      sortedActivities.reduce((activities, activity) => {
        const date = activity.date.toISOString().split("T")[0];
        const array = activities[date]
          ? [...activities[date], activity]
          : [activity];
        activities[date] = array;
        return activities;
      }, {} as { [key: string]: IActivity[] })
    );
  }
  @action loadActivities = async () => {
    this.loadingInitial = true;
    const { userStore } = this.rootStore;
    const { user } = userStore;
    try {
      const activities = await agent.Activities.list();
      runInAction("loading activities", () => {
        activities.forEach((a) => {
          setActivityProps(a, user!);
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
    let activity: IActivity | null = this.getActivity(id);
    if (activity) {
      this.activity = activity;
      return activity;
    } else {
      this.loadingInitial = true;
      try {
        activity = await agent.Activities.details(id);
        runInAction("getting activity", () => {
          if (activity) {
            setActivityProps(activity, this.rootStore.userStore.user!);
            this.activityRegistry.set(activity.id, activity);
          }
        });
        return activity;
      } catch (error) {
        console.error(error);
      } finally {
        runInAction("getting activity", () => {
          this.loadingInitial = false;
        });
      }
    }
  };
  @action clearActivity = () => {
    this.activity = null;
  };
  getActivity = (id: string) => {
    return this.activityRegistry.get(id) ?? null;
  };
  @action createActivity = async (activity: IActivity) => {
    this.submitting = true;
    try {
      await agent.Activities.create(activity);
      const attendee = createAttendee(this.rootStore.userStore.user!);
      attendee.isHost = true;
      let attendees = [];
      attendees.push(attendee);
      activity.isHost = true;
      activity.attendees = attendees;
      runInAction("creating activity", () => {
        this.activityRegistry.set(activity.id, activity);
        this.submitting = false;
      });
      history.push(`/activities/${activity.id}`);
    } catch (error) {
      console.error(error.response);
      toast.error("Problem submitting data");
    } finally {
      runInAction(() => {
        this.submitting = false;
      });
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
      history.push(`/activities/${activity.id}`);
    } catch (error) {
      console.error(error.response);
      toast.error("Problem submitting data");
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
  @action attendActivity = async () => {
    const attendee = createAttendee(this.rootStore.userStore.user!);
    if (this.activity) {
      this.loading = true;
      const id = this.activity.id;
      try {
        await agent.Activities.attend(id);
        runInAction(() => {
          if (this.activity) {
            this.activity.attendees.push(attendee);
            this.activity.isGoing = true;
            this.activityRegistry.set(this.activity.id, this.activity);
          }
        });
      } catch (error) {
        console.error(error);
        toast.error('Problem signing up to activity');
      } finally {
        runInAction(() => (this.loading = false));
      }
    }
  };
  @action cancelAttendance = async () => {
    if (this.activity) {
      this.loading = true;
      const id = this.activity.id;
      try {
        await agent.Activities.unattend(id);
        runInAction(() => {
          if (this.activity) {
            this.activity.attendees = this.activity.attendees.filter(
              (a) => a.username !== this.rootStore.userStore.user?.username
            );
            this.activity.isGoing = false;
            this.activityRegistry.set(this.activity.id, this.activity);
          }
        });
      } catch (error) {
        toast.error("Problem signing up to activity");
        console.error(error);
      } finally {
        runInAction(() => (this.loading = false));
      }
    }
  };
}
