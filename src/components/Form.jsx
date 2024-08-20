// "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=0&longitude=0"

import { useEffect, useState } from "react";

import styles from "./Form.module.css";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";

import Button from "./Button";
import Spinner from "./Spinner";
import Message from "./Message";
import BackButton from "./BackButton";
import { useUrlPosition } from "../hooks/useUrlPosition";
import { useNavigate } from "react-router-dom";
import { useCities } from "../contexts/CitiesContext";

export function convertToEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function Form() {
  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState("");
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [isLoadingGeolocation, setIsLoadingGeolocation] = useState(false);
  const [emoji, setEmoji] = useState("");
  const [geoCodingError, setGeoCodingError] = useState("");
  const navigate = useNavigate();
  const { createCity, isLoading } = useCities();

  const [lat, lng] = useUrlPosition();

  const BASE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";

  useEffect(
    function () {
      async function fetchCityData() {
        try {
          setGeoCodingError("");
          setIsLoadingGeolocation(true);
          const res = await fetch(
            `${BASE_URL}?latitude=${lat}&longitude=${lng}`
          );
          const data = await res.json();
          if (!data.countryCode)
            throw new Error(
              "That dosn't seems to be a city. Click somewhere else😉 "
            );
          setCityName(data.city || data.locality || "");
          setCountry(data.countryName);
          setEmoji(convertToEmoji(data.countryCode));
        } catch (err) {
          setGeoCodingError(err.message);
        } finally {
          setIsLoadingGeolocation(false);
        }
      }
      fetchCityData();
    },
    [lat, lng]
  );

  async function handleSubmit(e) {
    e.preventDefault();

    const newCity = {
      cityName,
      country,
      emoji,
      date,
      notes,
      position: { lat, lng },
    };

    await createCity(newCity);
    navigate("/app/cities");
  }

  if (isLoadingGeolocation) return <Spinner />;
  if (geoCodingError) return <Message message={geoCodingError} />;
  if (!lat && !lng) return <Message message="Start by clicking on the map" />;

  return (
    <form
      className={`${styles.form} ${isLoading ? styles.loading : ""}`}
      onSubmit={handleSubmit}
    >
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) => setCityName(e.target.value)}
          value={cityName}
        />
        <span className={styles.flag}>{emoji}</span>
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName}?</label>
        <DatePicker
          selected={date}
          onChange={(date) => setDate(date)}
          id="date"
          dateFormat="dd/MM/yyyy"
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea
          id="notes"
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <Button type="primary">Add</Button>
        <BackButton />
      </div>
    </form>
  );
}

export default Form;
