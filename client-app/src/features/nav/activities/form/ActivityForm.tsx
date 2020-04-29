import React, { useState, useContext, useEffect } from "react";
import { Segment, Form, Button, Grid } from "semantic-ui-react";
import { observer } from "mobx-react-lite";
import { v4 as uuid } from "uuid";
import { RouteComponentProps } from "react-router-dom";
import { Form as FinalForm, Field } from "react-final-form";
import { ActivityFormValues } from "../../../../app/models/activity";
import { TextInput } from "../../../../app/common/form/TextInput";
import { TextAreaInput } from "../../../../app/common/form/TextAreaInput";
import { SelectInput } from "../../../../app/common/form/SelectInput";
import { category } from "../../../../app/common/options/categoryOptions";
import { DateInput } from "../../../../app/common/form/DateInput";
import { combineDateAndTime } from "../../../../app/common/util/util";
import {
  combineValidators,
  isRequired,
  composeValidators,
  hasLengthGreaterThan,
} from "revalidate";
import { RootStoreContext } from "../../../../app/stores/rootStore";

const validate = combineValidators({
  title: isRequired({ message: "The event title is required" }),
  category: isRequired("Category"),
  description: composeValidators(
    isRequired("Description"),
    hasLengthGreaterThan(4)({
      message: "Description needs to be at least 5 characters",
    })
  )(),
  city: isRequired("City"),
  venue: isRequired("Venue"),
  date: isRequired("Date"),
  time: isRequired("Time"),
});

interface DetailParams {
  id: string;
}

export const ActivityForm: React.FC<RouteComponentProps<
  DetailParams
>> = observer(({ match, history }) => {
  const { activityStore } = useContext(RootStoreContext);
  const { submitting, loadActivity } = activityStore;
  const [activity, setActivity] = useState(new ActivityFormValues());
  const handleFinalFormSubmit = (values: any) => {
    console.log(values);
    const dateAndTime = combineDateAndTime(values.date, values.time);
    const { date, time, ...activity } = values;
    activity.date = dateAndTime;
    if (!activity.id) {
      let newActivity = {
        ...activity,
        id: uuid(),
      };
      activityStore.createActivity(newActivity);
    } else {
      activityStore.editActivity(activity);
    }
  };
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (match.params.id) {
      setLoading(true);
      loadActivity(match.params.id)
        .then((activity) => {
          if (activity) {
            setActivity(new ActivityFormValues(activity));
          }
        })
        .finally(() => setLoading(false));
    }
  }, [loadActivity, match.params.id]);
  return (
    <Grid>
      <Grid.Column width={10}>
        <Segment clearing>
          <FinalForm
            validate={validate}
            initialValues={activity}
            onSubmit={handleFinalFormSubmit}
            render={({ handleSubmit, invalid, pristine }) => {
              return (
                <Form onSubmit={handleSubmit} loading={loading}>
                  <Field
                    name="title"
                    placeholder="Title"
                    value={activity.title}
                    component={TextInput}
                  />
                  <Field
                    name="description"
                    placeholder="Description"
                    rows={3}
                    value={activity.description}
                    component={TextAreaInput}
                  />
                  <Field
                    name="category"
                    placeholder="Category"
                    options={category}
                    value={activity.category}
                    component={SelectInput}
                  />
                  <Form.Group widths="equal">
                    <Field
                      name="date"
                      placeholder="Date"
                      date={true}
                      value={activity.date}
                      component={DateInput}
                    />
                    <Field
                      name="time"
                      placeholder="Time"
                      time={true}
                      value={activity.time}
                      component={DateInput}
                    />
                  </Form.Group>
                  <Field
                    name="city"
                    placeholder="City"
                    value={activity.city}
                    component={TextInput}
                  />
                  <Field
                    name="venue"
                    placeholder="Venue"
                    value={activity.venue}
                    component={TextInput}
                  />
                  <Button
                    loading={submitting}
                    disabled={loading || invalid || pristine}
                    floated="right"
                    positive
                    type="submit"
                    content="Submit"
                  />
                  <Button
                    floated="right"
                    type="button"
                    content="Cancel"
                    disabled={loading}
                    onClick={
                      activity.id
                        ? () => history.push(`/activities/${activity.id}`)
                        : () => {
                            history.push("/activities");
                          }
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
