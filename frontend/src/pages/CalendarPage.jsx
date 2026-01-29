import React, { useEffect, useState } from "react";
import Calendar from "../components/Calendar/Calendar";

const CalendarPage = () => {
  const [bookedDatesByVilla, setBookedDatesByVilla] = useState({});

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(
          "https://shivaam-farms-and-resorts-villa-1.onrender.com/api/bookings"
        );

        const result = await res.json();

        // ✅ FIXED
        const data = Array.isArray(result) ? result : result.data || [];

        const villaData = {};

        data.forEach((booking) => {
          const villa = booking.villa;
          const checkIn = booking.checkIn || booking.check_in;
          const checkOut = booking.checkOut || booking.check_out;

          if (!villa || !checkIn || !checkOut) return;

          if (!villaData[villa]) {
            villaData[villa] = [];
          }

          let currentDate = new Date(checkIn);
          let endDate = new Date(checkOut);

          // checkout day excluded ✔
          while (currentDate < endDate) {
            const formattedDate =
              currentDate.toLocaleDateString("en-CA");

            villaData[villa].push(formattedDate);
            currentDate.setDate(currentDate.getDate() + 1);
          }
        });

        console.log("Booked Dates:", villaData); // debug
        setBookedDatesByVilla(villaData);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchBookings();
  }, []);

  return (
    <div>
      <h2 className="mb-3">Villa Calendar</h2>

      <Calendar
        bookedDatesByVilla={bookedDatesByVilla}
        onDateSelect={() => {}}
      />
    </div>
  );
};

export default CalendarPage;
