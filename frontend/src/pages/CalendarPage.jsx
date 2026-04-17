import React, { useEffect, useState } from "react";
import Calendar from "../components/Calendar/Calendar";

const CalendarPage = () => {
  const [bookedDatesByVilla, setBookedDatesByVilla] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          "https://shivaamfarmsandresorts-villa-software-1.onrender.com/api/bookings"
        );

        const result = await res.json();
        const data = result.data || [];

        const villaData = {};

        data.forEach((booking) => {
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

        setBookedDatesByVilla(villaData);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError("Failed to load calendar data.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // ✅ EARLY RETURN LOADING
 if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="text-center">
          <div className="spinner-border text-success" role="status"></div>
          <p className="mt-3 fw-semibold">Loading Calendar...</p>
        </div>
      </div>
    );
  }

  // ✅ EARLY RETURN ERROR
  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

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
