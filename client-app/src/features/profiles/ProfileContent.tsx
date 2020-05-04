import React from "react";
import { Tab } from "semantic-ui-react";
import { ProfilePhotos } from "./ProfilePhotos";
import { observer } from "mobx-react-lite";

const panes = [
  { menuItem: "About", render: () => <Tab.Pane>About content</Tab.Pane> },
  { menuItem: "Photos", render: () => <ProfilePhotos /> },
  {
    menuItem: "Activities",
    render: () => <Tab.Pane>Activities content</Tab.Pane>,
  },
  {
    menuItem: "Followers",
    render: () => <Tab.Pane>Followers content</Tab.Pane>,
  },
  {
    menuItem: "Following",
    render: () => <Tab.Pane>Following content</Tab.Pane>,
  },
];

export const ProfileContent: React.FC = observer(() => {
  return (
    <div>
      <Tab
        menu={{ fluid: true, vertical: true }}
        menuPosition="right"
        panes={panes}
        activeIndex={1}
      />
    </div>
  );
});
