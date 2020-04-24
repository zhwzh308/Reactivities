import React, { useContext } from "react";
import { Button, Container, Menu } from "semantic-ui-react";
import { observer } from "mobx-react-lite";
import ActivityStore from "../../app/stores/activityStore";

export const NavBar = observer(() => {
  const activityStore = useContext(ActivityStore);
  return (
    <Menu fixed="top" inverted>
      <Container>
        <Menu.Item header>
          <img src="/assets/logo.png" alt="Logo" style={{marginRight: 10}} />
          Reactivities
        </Menu.Item>
        <Menu.Item name="Activities" />
        <Menu.Item>
            <Button positive content='Create Activity' onClick={activityStore.openCreateForm} />
        </Menu.Item>
      </Container>
    </Menu>
  );
});
