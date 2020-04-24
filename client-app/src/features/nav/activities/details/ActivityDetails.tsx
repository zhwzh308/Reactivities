import React, { useContext, useEffect } from "react";
import { Card, Button, Image } from "semantic-ui-react";
import { observer } from "mobx-react-lite";
import ActivityStore from "../../../../app/stores/activityStore";
import { RouteComponentProps, Link } from "react-router-dom";
import { LoadingComponent } from "../../../../app/layout/LoadingComponent";

interface DetailParams {
  id: string;
}

export const ActivityDetails: React.FC<RouteComponentProps<
  DetailParams
>> = observer(({ match, history }) => {
  const activityStore = useContext(ActivityStore);
  const { activity, loadActivity, loadingInitial } = activityStore;
  useEffect(() => {
    loadActivity(match.params.id);
  }, [loadActivity, match.params.id]);
  if (loadingInitial || !activity) {
    return <LoadingComponent content='Loading activity...' />
  }
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
            as={Link}
            to={`/manage/${activity.id}`}
          />
          <Button
            basic
            color="grey"
            content="Cancel"
            onClick={() => history.push('/activities')}
          />
        </Button.Group>
      </Card.Content>
    </Card>
  );
});
