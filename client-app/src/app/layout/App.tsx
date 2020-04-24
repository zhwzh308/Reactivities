import React, {
  Fragment,
  useEffect,
  useContext,
} from "react";
import { Container } from "semantic-ui-react";
import "./styles.css";
import { NavBar } from "../../features/nav/NavBar";
import { ActivityDashboard } from "../../features/nav/activities/dashboard/ActivityDashboard";
import { LoadingComponent } from "./LoadingComponent";
import ActivityStore from "../stores/activityStore";
import { observer } from "mobx-react-lite";

const App = () => {
  const activityStore = useContext(ActivityStore);
  useEffect(() => {
    activityStore.loadActivities();
  }, [activityStore]);
  if (activityStore.loadingInitial) {
    return <LoadingComponent content="Loading activities..." />;
  }
  return (
    <Fragment>
      <NavBar />
      <Container style={{ marginTop: "7em" }}>
        <ActivityDashboard />
      </Container>
    </Fragment>
  );
};

export default observer(App);
