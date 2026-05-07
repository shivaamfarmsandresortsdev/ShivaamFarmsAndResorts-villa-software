import React, { useEffect, useState } from "react";
import Calendar from "../components/Calendar/Calendar";

// ✅ Works both local + deployed
const API_BASE =
  import.meta.env.VITE_API_BASE || "https://shivaamfarmsandresorts-villa-software-new.onrender.com";

const CalendarPage = () => {
  const [bookedDatesByVilla, setBookedDatesByVilla] = useState({});
  const [villas, setVillas] = useState([]); // ✅ NEW STATE
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => { 
      try {
        setLoading(true);
        setError(null);

        // 🔥 1️⃣ Fetch bookings
        const bookingRes = await fetch(`${API_BASE}/api/bookings`);
        const bookingResult = await bookingRes.json();
        const bookingData = bookingResult.data || [];

        // 🔥 2️⃣ Fetch villas
        const villaRes = await fetch(`${API_BASE}/api/villas`);
        const villaResult = await villaRes.json();
        const villaDataList = villaResult.data || [];

        // ✅ Set villas
        setVillas(villaDataList);

        // 🔥 3️⃣ Convert bookings → calendar format
        const villaData = {};

        bookingData.forEach((booking) => {
          const villasArr = booking.villas || [booking.villa];

          const checkIn = booking.checkIn || booking.check_in;
          const checkOut = booking.checkOut || booking.check_out;

          if (!checkIn || !checkOut) return;

          villasArr.forEach((villa) => {
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
        console.error("Error fetching calendar data:", err);
        setError("Failed to load calendar data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ✅ LOADING
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

  // ✅ ERROR
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

      {/* ✅ PASS VILLAS HERE */}
      <Calendar
        villas={villas} // 🔥 IMPORTANT LINE
        bookedDatesByVilla={bookedDatesByVilla}
        onDateSelect={() => {}}
      />
    </div>
  );
};

export default CalendarPage;