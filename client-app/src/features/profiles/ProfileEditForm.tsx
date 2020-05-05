import React, { useContext, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { RootStoreContext } from "../../app/stores/rootStore";
import { Grid, Segment, Form, Button } from "semantic-ui-react";
import { Form as FinalForm, Field} from 'react-final-form';
import { TextInput } from "../../app/common/form/TextInput";
import { TextAreaInput } from "../../app/common/form/TextAreaInput";
import { history } from "../..";
import { combineValidators, isRequired } from "revalidate";
import { LoadingComponent } from "../../app/layout/LoadingComponent";

const validate = combineValidators({
  bio: isRequired("Bio")
})

export const ProfileEditForm: React.FC = observer(() => {
  const { profileStore, userStore } = useContext(RootStoreContext);
  const { user } = userStore;
  const { profile, loadProfile, loadingProfile } = profileStore;
  const handleFinalFormSubmit = (values: any) => {
    profileStore.editProfile(values)
    .then(() => history.push(`/profile/${values.userName}`));
  };
  useEffect(() => {
    if (profile == null) {
      if (user) {
        loadProfile(user.username);
      }
    }
  }, [profile, user, loadProfile]);
  if (loadingProfile) {
    return <LoadingComponent content='Loading profile' />
  }
  return (
    <Grid>
      <Grid.Column width={10}>
        <Segment clearing>
          <FinalForm
            onSubmit={handleFinalFormSubmit}
            initialValues={profile}
            validate={validate}
            render={({ handleSubmit, invalid, pristine, submitting }) => {
              return (
                <Form onSubmit={handleSubmit} loading={loadingProfile}>
                  <Field
                    name="displayName"
                    placeholder="Display name"
                    component={TextInput}
                    value={profile?.displayName}
                  />
                  <Field
                    name="bio"
                    placeholder="Bio"
                    rows={3}
                    component={TextAreaInput}
                    value={profile?.bio}
                  />
                  <Button
                    loading={submitting}
                    disabled={loadingProfile || invalid || pristine}
                    floated="right"
                    positive
                    type="submit"
                    content="Submit"
                  />
                  <Button
                    floated="right"
                    type="button"
                    content="Cancel"
                    disabled={loadingProfile}
                    onClick={() =>
                      history.push(`/profile/${profile?.userName}`)
                    }
                  />
                </Form>
              );
            }}
          />
        </Segment>
      </Grid.Column>
    </Grid>
  );
});
