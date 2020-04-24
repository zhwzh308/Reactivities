import React from "react";
import { Button, Container, Menu } from "semantic-ui-react";
import { observer } from "mobx-react-lite";
import { NavLink } from "react-router-dom";

export const NavBar = observer(() => {
  return (
    <Menu fixed="top" inverted>
      <Container>
        <Menu.Item header as={NavLink} exact to='/'>
          <img src="/assets/logo.png" alt="Logo" style={{marginRight: 10}} />
          Reactivities
        </Menu.Item>
        <Menu.Item name="Activities" header as={NavLink} to='/activities' />
        <Menu.Item>
            <Button positive content='Create Activity' as={NavLink} to='/createActivity' />
        </Menu.Item>
      </Container>
    </Menu>
  );
});
