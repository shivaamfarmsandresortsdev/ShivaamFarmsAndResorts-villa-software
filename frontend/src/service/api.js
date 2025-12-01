import axios from "axios";

export const fetchBookings = async () => {
  try {
    const response = await axios.get("/api/bookings");
    return response.data; // should be an array
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }
};

export const fetchBookedDates = async (year, month) => {
  try {
    const response = await axios.get(`/api/bookings?year=${year}&month=${month + 1}`);
    return response.data; // should be an array of date strings
  } catch (error) {
    console.error("Error fetching booked dates:", error);
    return [];
  }
};