import React, { useContext, Fragment } from "react";
import { Item, Label } from "semantic-ui-react";
import { observer } from "mobx-react-lite";
import { ActivityListItem } from "./ActivityListItem";
import { RootStoreContext } from "../../../app/stores/rootStore";
import { format } from 'date-fns';

export const ActivityList = observer(() => {
  const { activityStore } = useContext(RootStoreContext);
  const { activitiesByDate } = activityStore;
  return (
    <Fragment>
      {activitiesByDate.map(([group, activities]) => {
        return (
          <Fragment key={group}>
            <Label size="large" color="blue">
              {format(Date.parse(group), "eeee do MMMM")}
            </Label>
            <Item.Group divided>
              {activities.map((activity) => (
                <ActivityListItem activity={activity} key={activity.id} />
              ))}
            </Item.Group>
          </Fragment>
        );
      })}
    </Fragment>
  );
});