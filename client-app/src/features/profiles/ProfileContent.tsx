import React from "react";
import { Tab } from "semantic-ui-react";
import { ProfilePhotos } from "./ProfilePhotos";
import { observer } from "mobx-react-lite";
import { ProfileDescription } from "./ProfileDescription";
import { ProfileFollowings } from "./ProfileFollowings";

const panes = [
  { menuItem: "About", render: () => <ProfileDescription /> },
  { menuItem: "Photos", render: () => <ProfilePhotos /> },
  {
    menuItem: "Activities",
    render: () => <Tab.Pane>Activities content</Tab.Pane>,
  },
  {
    menuItem: "Followers",
    render: () => <ProfileFollowings />,
  },
  {
    menuItem: "Following",
    render: () => <ProfileFollowings />,
  },
];

interface IProps {
  setActiveTab: (activeIndex: number) => void;
}

export const ProfileContent: React.FC<IProps> = observer(({ setActiveTab }) => {
  return (
    <div>
      <Tab
        menu={{ fluid: true, vertical: true }}
        menuPosition="right"
        panes={panes}
        onTabChange={(event, data) => setActiveTab(Number(data.activeIndex))}
      />
    </div>
  );
});
