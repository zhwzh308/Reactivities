import React, { useContext } from "react";
import { Card, Button, Image } from "semantic-ui-react";
import { observer } from "mobx-react-lite";
import ActivityStore from "../../../../app/stores/activityStore";

export const ActivityDetails = observer(() => {
  const activityStore = useContext(ActivityStore);
  const { selectedActivity: activity } = activityStore;
  return (
    <Card fluid>
      <Image
        src={`/assets/categoryImages/${activity!.category}.jpg`}
        wrapped
        ui={false}
      />
      <Card.Content>
        <Card.Header>{activity!.title}</Card.Header>
        <Card.Meta>
          <span>{activity!.date}</span>
        </Card.Meta>
        <Card.Description>{activity!.description}</Card.Description>
      </Card.Content>
      <Card.Content extra>
        <Button.Group widths={2}>
          <Button
            basic
            color="blue"
            content="Edit"
            onClick={() => activityStore.openEditForm(activity!.id)}
          />
          <Button
            basic
            color="grey"
            content="Cancel"
            onClick={activityStore.cancelSelectedActivity}
          />
        </Button.Group>
      </Card.Content>
    </Card>
  );
});
