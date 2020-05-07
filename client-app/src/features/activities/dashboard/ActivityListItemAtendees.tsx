import React from "react";
import { Image, List, Popup } from "semantic-ui-react";
import { IAttendee } from "../../../app/models/activity";

interface IProps {
  attendees: IAttendee[];
}

const styles = {
  borderColor: 'orange',
  borderWidth: 2
}

export const ActivityListItemAtendees: React.FC<IProps> = ({ attendees }) => {
  return (
    <List horizontal>
      {attendees.map((a) => (
        <List.Item key={a.username}>
          <Popup
            header={a.displayName}
            trigger={
              <Image
                size="mini"
                circular
                src={a.image || `/assets/user.png`}
                bordered
                style={a.following ? styles : null}
              />
            }
          />
        </List.Item>
      ))}
    </List>
  );
};
