import { observable, action, computed, runInAction, reaction, toJS } from "mobx";
import { SyntheticEvent } from "react";
import { IActivity } from "../models/activity";
import agent from "../api/agent";
import { history } from "../..";
import { toast } from "react-toastify";
import { RootStore } from "./rootStore";
import { setActivityProps, createAttendee } from "../common/util/util";
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";

const LIMIT = 2;

export default class ActivityStore {
  rootStore: RootStore;
  /**
   * Activity Store
   */
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    reaction(()=>this.predicate.keys(), () => {
      this.page = 0;
      this.activityRegistry.clear();
      this.loadActivities();
    });
  }
  @observable activityRegistry = new Map<string, IActivity>();
  @observable loadingInitial = false;
  @observable loading = false;
  @observable activity: IActivity | null = null;
  @observable submitting = false;
  @observable target = "";
  @observable.ref hubConnection: HubConnection | null = null;
  @observable activityCount = 0;
  @observable page = 0;
  @observable predicate = new Map();
  @computed get axiosParams() {
    const params = new URLSearchParams();
    params.append('limit', String(LIMIT));
    params.append('offset', String(this.page ? this.page * LIMIT: 0));
    this.predicate.forEach((value, key) => {
      if (key === 'startDate') {
        params.append(key, value.toISOString());
      } else {
        params.append(key, value)
      }
    })
    return params;
  }
  @computed get activitiesByDate() {
    return this.groupActivitiesByDate(
      Array.from(this.activityRegistry.values())
    );
  }
  @computed get totalNumberOfPages() {
    return Math.ceil(this.activityCount / LIMIT);
  }
  @action setPage = (page: number) => {
    this.page = page;
  }
  @action setPredicate = (predicate: string, value: string | Date) => {
    this.predicate.clear();
    if (predicate !== "all") {
      this.predicate.set(predicate, value);
    }
  }
  @action createHubConnection = (activityId: string) => {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(process.env.REACT_APP_API_CHAT_URL!, {
        accessTokenFactory: () => this.rootStore.commonStore.token!,
      })
      .configureLogging(LogLevel.Information)
      .build();
    this.hubConnection
      .start()
      .then(() => console.log(this.hubConnection?.state))
      .then(() => {
        console.log("Attempting to join group");
        this.hubConnection?.invoke("AddToGroup", activityId).then(() => {
          this.hubConnection?.on("ReceiveComment", (c) => {
            runInAction(() => this.activity!.comments.push(c));
          });
          this.hubConnection?.on("Send", (msg) => {
            toast.info(msg);
          });
        });
      })
      .catch(console.error);
  };
  @action stopConnection = () => {
    if (this.hubConnection) {
      this.hubConnection
        .invoke("RemoveFromGroup", this.activity?.id)
        .then(this.hubConnection.stop)
        .then(() => console.log("Connection stopped"))
        .catch(console.error);
    }
  };
  @action addComment = async (values: any) => {
    values.activityId = this.activity?.id;
    try {
      await this.hubConnection?.invoke("SendComment", values);
    } catch (error) {
      console.error(error);
    }
  };
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
      const activityEnvelope = await agent.Activities.list(this.axiosParams);
      const { activities, activityCount } = activityEnvelope;
      runInAction("Done loadActivities", () => {
        activities.forEach((a) => {
          setActivityProps(a, user!);
          this.activityRegistry.set(a.id, a);
        });
        this.activityCount = activityCount;
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
      // we got an observable, need to convert to js.
      return toJS(activity);
    } else {
      this.loadingInitial = true;
      try {
        activity = await agent.Activities.details(id);
        runInAction("getting activity", () => {
          if (activity) {
            this.activity = setActivityProps(
              activity,
              this.rootStore.userStore.user!
            );
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
      activity.comments = [];
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
        toast.error("Problem signing up to activity");
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
