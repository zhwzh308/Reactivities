import React, { useContext } from "react";
import { RootStoreContext } from "../../app/stores/rootStore";
import { observer } from "mobx-react-lite";
import { Tab, Button, Grid, Header } from "semantic-ui-react";
import { history } from "../..";

export const ProfileDescription: React.FC = observer(() => {
  const { profileStore } = useContext(RootStoreContext);
  const { profile, isCurrentUser } = profileStore;
  const editProfile = () => history.push("/editProfile");
  return (
    <Tab.Pane>
      <Grid>
        <Grid.Column width={16}>
          <Header
            floated="left"
            icon="user"
            content={`About ${profile?.userName}`}
          />
          {isCurrentUser && (
            <Button
              floated="right"
              basic
              content="Edit Profile"
              onClick={editProfile}
            />
          )}
        </Grid.Column>
        <Grid.Column width={16}>
          <span>{profile?.bio}</span>
        </Grid.Column>
      </Grid>
    </Tab.Pane>
  );
});
