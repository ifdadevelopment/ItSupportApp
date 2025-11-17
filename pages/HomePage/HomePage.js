import { useContext, useEffect, useState } from "react";
import { DataContext } from "../../context";
import LoadingSpinner from "../../component/LoadingSpinner/LoadingSpinner";
import UserHomePage from "./HomeScreen/UserHomePage";
import AdminHome from "./HomeScreen/AdminHomePage";
import ITDepartmentHomePage from "./HomeScreen/ItScreenPage";

const HomePage = ({ navigation }) => {
  const { user, apiGet, token } = useContext(DataContext);
  const [data, setData] = useState(null);  // Initialize data as null
  const [loading, setLoading] = useState(true);  // Start with loading true

  useEffect(() => {
    // Fetch data once component mounts
    apiGet('/home-page/', {}, (res) => {
      setData(res);
      setLoading(false);  // Once data is fetched, set loading to false
    });
  }, []);

  // If user or data is not available, show the loading spinner
  if (loading) {
    return <LoadingSpinner />;  // Show loading spinner until the data is loaded
  }

  // Once data is available, render the page based on user type
  return (
    <>
      {user?.user_type === "user" ? (
        <UserHomePage data={data} navigation={navigation} />
      ) : user?.user_type === "admin" ? (
        <AdminHome data={data} navigation={navigation} />
      ) : user?.user_type === "technician" ? (
        <ITDepartmentHomePage data={data} navigation={navigation} />
      ) : null}
    </>
  );
};

export default HomePage;
