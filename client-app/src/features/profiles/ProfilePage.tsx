import React, { useContext, useEffect } from "react";
import ProfileHeader from "./ProfileHeader";
import { Grid } from "semantic-ui-react";
import { ProfileContent } from "./ProfileContent";
import { RootStoreContext } from "../../app/stores/rootStore";
import { RouteComponentProps } from "react-router-dom";
import { LoadingComponent } from "../../app/layout/LoadingComponent";
import { observer } from "mobx-react-lite";

interface RouteParams {
  username: string;
}

interface IProps extends RouteComponentProps<RouteParams> {}

export const ProfilePage: React.FC<IProps> = observer(({ match }) => {
  const { profileStore } = useContext(RootStoreContext);
  const {
    loadingProfile,
    profile,
    loadProfile,
    loading,
    follow,
    unfollow,
    isCurrentUser,
    setActiveTab
  } = profileStore;
  useEffect(() => {
    loadProfile(match.params.username);
  }, [loadProfile, match]);
  if (loadingProfile) {
    return <LoadingComponent content="Loading profile..." />;
  }
  return (
    <Grid>
      <Grid.Column width={16}>
        <ProfileHeader
          profile={profile!}
          isCurrentUser={isCurrentUser}
          loading={loading}
          follow={follow}
          unfollow={unfollow}
        />
        <ProfileContent
          setActiveTab={setActiveTab} />
      </Grid.Column>
    </Grid>
  );
});
