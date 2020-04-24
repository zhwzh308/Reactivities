import React, { useState, FormEvent, useContext } from "react";
import { Segment, Form, Button } from "semantic-ui-react";
import { IActivity } from "../../../../app/models/activity";
import { v4 as uuid } from "uuid";
import ActivityStore from "../../../../app/stores/activityStore";
import { observer } from "mobx-react-lite";

export const ActivityForm = observer(() => {
  const activityStore = useContext(ActivityStore);
  const {selectedActivity: initialFormState, submitting, cancelFormOpen} = activityStore;
  const initializeForm = () => {
    if (initialFormState) {
      return initialFormState;
    }
    return {
      id: "",
      title: "",
      category: "",
      description: "",
      date: "",
      city: "",
      venue: "",
    };
  };
  const [activity, setActivity] = useState<IActivity>(initializeForm);
  const handleInputChange = (
    event: FormEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.currentTarget;
    setActivity({
      ...activity,
      [name]: value,
    });
  };
  const handleSubmit = () => {
    if (activity.id.length === 0) {
      let newActivity = {
        ...activity,
        id: uuid(),
      };
      activityStore.createActivity(newActivity);
    } else {
      activityStore.editActivity(activity);
    }
  };
  return (
    <Segment clearing>
      <Form onSubmit={handleSubmit}>
        <Form.Input
          onChange={handleInputChange}
          name="title"
          placeholder="Title"
          value={activity.title}
        />
        <Form.TextArea
          onChange={handleInputChange}
          name="description"
          rows={2}
          placeholder="Description"
          value={activity.description}
        />
        <Form.Input
          onChange={handleInputChange}
          name="category"
          placeholder="Category"
          value={activity.category}
        />
        <Form.Input
          onChange={handleInputChange}
          name="date"
          type="datetime-local"
          placeholder="Date"
          value={activity.date}
        />
        <Form.Input
          onChange={handleInputChange}
          name="city"
          placeholder="City"
          value={activity.city}
        />
        <Form.Input
          onChange={handleInputChange}
          name="venue"
          placeholder="Venue"
          value={activity.venue}
        />
        <Button
          loading={submitting}
          floated="right"
          positive
          type="submit"
          content="Submit"
        />
        <Button
          floated="right"
          type="button"
          content="Cancel"
          onClick={cancelFormOpen}
        />
      </Form>
    </Segment>
  );
});
