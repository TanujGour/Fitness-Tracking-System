import { useEffect, useState } from "react";
import axios from "axios";

function Activity() {
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  const [data, setData] = useState([]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_URL}/data`, {
        headers: { Authorization: token },
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="page-container">
      <h2>Activity Tracking</h2>

      {data.map((item, i) => (
        <div key={i} className="card">
          <p>Steps: {item.steps}</p>
          <p>Calories: {item.calories}</p>
        </div>
      ))}
    </div>
  );
}

export default Activity;