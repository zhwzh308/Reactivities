import { RootStore } from "./rootStore";
import { observable, action, runInAction, computed } from "mobx";
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
  }
  @observable profile: IProfile | null = null;
  @observable loading = false;
  @observable loadingProfile: boolean = true;
  @computed get isCurrentUser() {
    const { user } = this.rootStore.userStore;
    if (user && this.profile) {
      return user.username === this.profile.userName;
    }
    return false;
  }
  @observable uploadingPhoto: boolean = false;
  @action loadProfile = async (username: string) => {
    this.loadingProfile = true;
    try {
      const profile = await agent.Profiles.get(username);
      console.log(profile);
      runInAction(() => {
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
  @action setMainPhoto = async (photo: IPhoto) => {
    this.loading = true;
    try {
      await agent.Profiles.setMainPhoto(photo.id);
      runInAction(() => {
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
      runInAction(() => (this.loading = false));
    }
  };
  @action deletePhoto = async (photo: IPhoto) => {
    this.loading = true;
    try {
      await agent.Profiles.deletePhoto(photo.id);
      runInAction(() => {
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
      runInAction(() => (this.loading = false));
    }
  };
  @action uploadPhoto = async (file: Blob) => {
    this.uploadingPhoto = true;
    try {
      const photo = await agent.Profiles.uploadPhoto(file);
      runInAction(() => {
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
      runInAction(() => {
        this.uploadingPhoto = false;
      });
    }
  };
}
