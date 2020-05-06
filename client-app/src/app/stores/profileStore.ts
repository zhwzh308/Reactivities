import { RootStore } from "./rootStore";
import { observable, action, runInAction, computed, reaction } from "mobx";
import { IProfile, IPhoto } from "../models/profile";
import agent from "../api/agent";
import { toast } from "react-toastify";

export default class ProfileStore {
  rootStore: RootStore;
  /**
   * Profile Store
   */
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    reaction(
      () => this.activeTab,
      (activeTab) => {
        if (activeTab === 3 || activeTab === 4) {
          const predicate = activeTab === 3 ? "followers" : "following";
          console.log("Loading with predicate", predicate);
          this.loadFollowings(predicate);
        } else {
          this.followings = [];
        }
      }
    );
  }
  @observable profile: IProfile | null = null;
  @observable loading = false;
  @observable loadingProfile: boolean = true;
  @observable followings: IProfile[] = [];
  @observable activeTab: number = 0;
  @computed get isCurrentUser() {
    const { user } = this.rootStore.userStore;
    if (user && this.profile) {
      return user.username === this.profile.userName;
    }
    return false;
  }
  @observable uploadingPhoto: boolean = false;
  @action setActiveTab = (activeIndex: number) => {
    this.activeTab = activeIndex;
  };
  @action loadProfile = async (username: string) => {
    this.loadingProfile = true;
    try {
      const profile = await agent.Profiles.get(username);
      runInAction("Done loadProfile", () => {
        this.profile = profile;
      });
    } catch (error) {
      console.error(error);
    } finally {
      runInAction(
        "Finalize loading profile",
        () => (this.loadingProfile = false)
      );
    }
  };
  @action editProfile = async (profile: IProfile) => {
    this.loadingProfile = true;
    try {
      await agent.Profiles.update(profile);
      runInAction("Done editProfile", () => {
        this.profile = { ...this.profile!, ...profile };
        const { displayName } = profile;
        if (this.isCurrentUser) {
          this.rootStore.userStore.user!.displayName = displayName;
        }
      });
    } catch (error) {
      console.log(error);
      toast.error("Error updating profile");
    } finally {
      runInAction("Finally editProfile", () => (this.loadingProfile = false));
    }
  };
  @action setMainPhoto = async (photo: IPhoto) => {
    this.loading = true;
    try {
      await agent.Profiles.setMainPhoto(photo.id);
      runInAction("Done setMainPhoto", () => {
        this.rootStore.userStore.user!.image = photo.url;
        if (this.profile) {
          this.profile.photos.find((a) => a.isMain)!.isMain = false;
          this.profile.photos.find((a) => a.id === photo.id)!.isMain = true;
          this.profile.image = photo.url;
        }
      });
    } catch (error) {
      console.error(error);
      toast.error("Problem setting photo as main");
    } finally {
      runInAction("Finally setMainPhoto", () => (this.loading = false));
    }
  };
  @action deletePhoto = async (photo: IPhoto) => {
    this.loading = true;
    try {
      await agent.Profiles.deletePhoto(photo.id);
      runInAction("Done deletePhoto", () => {
        if (this.profile) {
          this.profile.photos = this.profile.photos.filter(
            (a) => a.id !== photo.id
          );
        }
      });
    } catch (error) {
      console.error(error);
      toast.error("Problem deleting the photo");
    } finally {
      runInAction("Finally deletePhoto", () => (this.loading = false));
    }
  };
  @action uploadPhoto = async (file: Blob) => {
    this.uploadingPhoto = true;
    try {
      const photo = await agent.Profiles.uploadPhoto(file);
      runInAction("Done uploadPhoto", () => {
        if (this.profile) {
          this.profile.photos.push(photo);
          if (photo.isMain && this.rootStore.userStore.user) {
            this.rootStore.userStore.user.image = photo.url;
            this.profile.image = photo.url;
          }
        }
      });
    } catch (error) {
      console.error(error);
      toast.error("Problem uploading photo");
    } finally {
      runInAction("Finally uploadPhoto", () => {
        this.uploadingPhoto = false;
      });
    }
  };
  @action follow = async (username: string) => {
    this.loading = true;
    try {
      await agent.Profiles.follow(username);
      runInAction("Done follow", () => {
        if (this.profile) {
          this.profile.following = true;
          this.profile.followersCount++;
        }
      });
    } catch (error) {
      console.error(error);
      toast.error("Problem following user");
    } finally {
      runInAction("Finally follow", () => {
        this.loading = false;
      });
    }
  };
  @action unfollow = async (username: string) => {
    this.loading = true;
    try {
      await agent.Profiles.unfollow(username);
      runInAction("Done unfollow", () => {
        if (this.profile) {
          this.profile.following = false;
          this.profile.followersCount--;
        }
      });
    } catch (error) {
      console.error(error);
      toast.error("Problem following user");
    } finally {
      runInAction("Finally unfollow", () => {
        this.loading = false;
      });
    }
  };
  @action loadFollowings = async (predicate: string) => {
    this.loading = true;
    try {
      const profiles = await agent.Profiles.listFollowings(
        this.profile!.userName,
        predicate
      );
      runInAction("Done loadFollowings", () => {
        this.followings = profiles;
      });
    } catch (error) {
      console.error(error);
      toast.error("Problem loading followings");
    } finally {
      runInAction("Finally loadFollowings", () => {
        this.loading = false;
      });
    }
  };
}
