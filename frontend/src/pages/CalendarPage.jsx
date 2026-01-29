import React, { useEffect, useState } from "react";
import Calendar from "../components/Calendar/Calendar";

const CalendarPage = () => {
  const [bookedDatesByVilla, setBookedDatesByVilla] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(
          "https://shivaam-farms-and-resorts-villa-1.onrender.com/api/bookings"
        );

        const result = await res.json();

        // ✅ Works with: [], {data:[]}, {bookings:[]}
        const data = Array.isArray(result)
          ? result
          : result.data || result.bookings || [];

        const villaData = {};

        data.forEach((booking) => {
          const villa = booking.villa;
          const checkIn = booking.checkIn || booking.check_in;
          const checkOut = booking.checkOut || booking.check_out;

          if (!villa || !checkIn || !checkOut) return;

          if (!villaData[villa]) villaData[villa] = [];

          let currentDate = new Date(checkIn);
          let endDate = new Date(checkOut);

          // ✅ Checkout date NOT included
          while (currentDate < endDate) {
            const formattedDate =
              currentDate.toLocaleDateString("en-CA"); // YYYY-MM-DD

            villaData[villa].push(formattedDate);
            currentDate.setDate(currentDate.getDate() + 1);
          }
        });

        console.log("Booked Dates By Villa:", villaData);

        setBookedDatesByVilla(villaData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return <h3>Loading calendar...</h3>;
  }

  return (
    <div>
      <h2 className="mb-3">Villa Calendar</h2>

      <Calendar
        bookedDatesByVilla={bookedDatesByVilla || {}}
        onDateSelect={() => {}}
      />
    </div>
  );
};

export default CalendarPage;
