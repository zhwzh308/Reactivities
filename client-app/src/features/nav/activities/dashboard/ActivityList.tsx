import React, { useContext } from "react";
import { Item, Button, Label, Segment } from "semantic-ui-react";
import { observer } from "mobx-react-lite";
import ActivityStore from "../../../../app/stores/activityStore";
import { Link } from "react-router-dom";

export const ActivityList = observer(
  () => {
    const activityStore = useContext(ActivityStore);
    const { activitiesByDate: activities, target,submitting } = activityStore;
    return (
      <Segment clearing>
        <Item.Group divided>
          {activities.map((activity) => (
            <Item key={activity.id}>
              <Item.Content>
                <Item.Header as="a">{activity.title}</Item.Header>
                <Item.Meta>{activity.date}</Item.Meta>
                <Item.Description>
                  <div>{activity.description}</div>
                  <div>
                    {activity.city}, {activity.venue}
                  </div>
                </Item.Description>
                <Item.Extra>
                  <Button
                    as={Link} to={`/activities/${activity.id}`}
                    floated="right"
                    color="blue"
                    content="View"
                  ></Button>
                  <Button
                    loading={target === activity.id && submitting}
                    name={activity.id}
                    onClick={(e) => activityStore.deleteActivity(e, activity.id)}
                    floated="right"
                    color="red"
                    content="Delete"
                  ></Button>
                  <Label basic content={activity.category} />
                </Item.Extra>
              </Item.Content>
            </Item>
          ))}
        </Item.Group>
      </Segment>
    );
  }
);
