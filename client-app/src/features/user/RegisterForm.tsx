import React, { useContext } from "react";
import { combineValidators, isRequired } from "revalidate";
import { RootStoreContext } from "../../app/stores/rootStore";
import { IUserFormValues } from "../../app/models/user";
import { FORM_ERROR } from "final-form";
import { Form, Header, Button } from "semantic-ui-react";
import { Form as FinalForm, Field } from "react-final-form";
import { TextInput } from "../../app/common/form/TextInput";
import { ErrorMessage } from "../../app/common/form/ErrorMessage";
import { observer } from "mobx-react-lite";

const validate = combineValidators({
  username: isRequired("username"),
  displayName: isRequired("display name"),
  email: isRequired("email"),
  password: isRequired("password"),
});

export const RegisterForm: React.FC = observer(() => {
  const { userStore } = useContext(RootStoreContext);
  const { register } = userStore;
  return (
    <FinalForm
      onSubmit={(values: IUserFormValues) =>
        register(values).catch((error) => ({
          [FORM_ERROR]: error,
        }))
      }
      validate={validate}
      render={({
        handleSubmit,
        submitting,
        form,
        submitError,
        invalid,
        pristine,
        dirtySinceLastSubmit,
      }) => (
        <Form onSubmit={handleSubmit} error>
          <Header
            as="h2"
            content="Sign up to Reactivities"
            color="teal"
            textAlign="center"
          />
          <Field name="username" component={TextInput} placeholder="Username" />
          <Field
            name="displayName"
            component={TextInput}
            placeholder="Display Name"
          />
          <Field name="email" component={TextInput} placeholder="Email" />
          <Field
            name="password"
            component={TextInput}
            placeholder="password"
            type="password"
          />
          {submitError && !dirtySinceLastSubmit && (
            <ErrorMessage
              error={submitError}
            />
          )}
          <Button
            disabled={(invalid && !dirtySinceLastSubmit) || pristine}
            loading={submitting}
            color="teal"
            content="Register"
            fluid
          />
        </Form>
      )}
    />
  );
});
