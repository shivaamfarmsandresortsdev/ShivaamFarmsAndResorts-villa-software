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
        const data = result.data || [];

        const villaData = {};

        data.forEach((booking) => {

          // ✅ SUPPORT single & multiple villas
          const villas = booking.villas || [booking.villa];

          const checkIn = booking.checkIn || booking.check_in;
          const checkOut = booking.checkOut || booking.check_out;

          if (!checkIn || !checkOut) return;

          villas.forEach((villa) => {
            if (!villa) return;

            if (!villaData[villa]) {
              villaData[villa] = [];
            }

            let currentDate = new Date(checkIn);
            let endDate = new Date(checkOut);

            // ✅ Add all days between check-in & checkout
            while (currentDate < endDate) {
              const formattedDate =
                `${currentDate.getFullYear()}-${String(
                  currentDate.getMonth() + 1
                ).padStart(2, "0")}-${String(
                  currentDate.getDate()
                ).padStart(2, "0")}`;

              villaData[villa].push(formattedDate);
              currentDate.setDate(currentDate.getDate() + 1);
            }
          });

        });

        console.log("CALENDAR DATA:", villaData); // debug

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
