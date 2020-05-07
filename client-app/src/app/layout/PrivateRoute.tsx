import React, { useContext } from "react";
import {
  RouteProps,
  RouteComponentProps,
  Route,
  Redirect,
} from "react-router-dom";
import { RootStoreContext } from "../stores/rootStore";
import { observer } from "mobx-react-lite";
interface IProps extends RouteProps {
  component: React.ComponentType<RouteComponentProps<any>>;
}

export const PrivateRoute: React.FC<IProps> = observer(({
  component: Component,
  ...rest
}) => {
  const { userStore } = useContext(RootStoreContext);
  const { isLoggedIn } = userStore;
  return (
    <Route
      {...rest}
      render={(props) =>
        isLoggedIn ? <Component {...props} /> : <Redirect to={"/"} />
      }
    />
  );
});
