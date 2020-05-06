import { observable, computed, action, runInAction } from "mobx";
import { IUser, IUserFormValues } from "../models/user";
import agent from "../api/agent";
import { RootStore } from "./rootStore";
import { history } from "../..";

export default class UserStore {
  rootStore: RootStore;
  /**
   * User Store
   */
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
  }
  @observable user: IUser | null = null;
  @computed get isLoggedIn() {
    return !!this.user;
  }
  @action login = async (values: IUserFormValues) => {
    const user = await agent.User.login(values);
    runInAction("Setting user", () => (this.user = user));
    this.rootStore.commonStore.setToken(user.token);
    this.rootStore.commonStore.setAppLoaded();
    this.rootStore.modalStore.closeModal();
    history.push("/activities");
  };
  @action logout = () => {
    this.rootStore.commonStore.setToken(null);
    this.user = null;
    history.push("/");
  };
  @action getUser = async () => {
    try {
      const user = await agent.User.current();
      runInAction("Done getUser", () => (this.user = user));
    } catch (error) {
      console.error(error);
    }
  };
  @action register = async (values: IUserFormValues) => {
    const user = await agent.User.register(values);
    this.rootStore.commonStore.setToken(user.token);
    this.rootStore.modalStore.closeModal();
    history.push("/activities");
  };
}
