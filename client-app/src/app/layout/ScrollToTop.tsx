import { useLocation, withRouter } from "react-router-dom";
import { useEffect } from "react";

export const ScrollToTop = withRouter(({
    children
}: any) => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return children;
});
