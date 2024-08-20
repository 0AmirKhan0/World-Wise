import {
  createContext,
  useEffect,
  useContext,
  useReducer,
  useCallback,
} from "react";

const BASE_URL = "http://localhost:9000";

const CitiesContext = createContext();

const inisialState = {
  cities: [],
  isLoading: false,
  currentCity: {},
  error: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "rejected":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case "loading":
      return {
        ...state,
        isLoading: true,
      };
    case "cities/loaded":
      return {
        ...state,
        cities: action.payload,
        isLoading: false,
      };
    case "city/load":
      return {
        ...state,
        currentCity: action.payload,
        isLoading: false,
      };

    case "city/create":
      return {
        ...state,
        cities: [...state.cities, action.payload],
        isLoading: false,
        currentCity: action.payload,
      };
    case "city/delete":
      return {
        ...state,
        cities: [...state.cities.filter((city) => city.id !== action.payload)],
        isLoading: false,
      };

    default:
      throw new Error("Unknown action type");
  }
}

function CitiesProvider({ children }) {
  const [{ cities, isLoading, currentCity, error }, dispatch] = useReducer(
    reducer,
    inisialState
  );

  useEffect(function () {
    async function fetchCities() {
      dispatch({ type: "loading" });

      try {
        const res = await fetch(`${BASE_URL}/cities`);
        const data = await res.json();
        dispatch({ type: "cities/loaded", payload: data });
      } catch {
        dispatch({
          type: "rejected",
          payload: "There was an error loading cities...",
        });
      }
    }
    fetchCities();
  }, []);

  const getCity = useCallback(
    async function getCity(id) {
      if (currentCity.id === Number(id)) return;
      dispatch({ type: "loading" });
      try {
        const res = await fetch(`${BASE_URL}/cities/${id}`);
        const data = await res.json();
        dispatch({ type: "city/load", payload: data });
      } catch {
        dispatch({
          type: "rejected",
          payload: "There was an error loading city...",
        });
      }
    },
    [currentCity.id]
  );

  async function createCity(newCity) {
    dispatch({ type: "loading" });

    try {
      const res = await fetch(`${BASE_URL}/cities/`, {
        method: "POST",
        body: JSON.stringify(newCity),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      dispatch({ type: "city/create", payload: data });
    } catch {
      dispatch({
        type: "rejected",
        payload: "There was an error creating city...",
      });
    }
  }

  async function deleteCity(id) {
    dispatch({ type: "loading" });

    try {
      await fetch(`${BASE_URL}/cities/${id}`, { method: "DELETE" });
      dispatch({ type: "city/delete", payload: id });
    } catch {
      dispatch({
        type: "rejected",
        payload: "There was an error deleting city...",
      });
    }
  }

  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        getCity,
        currentCity,
        createCity,
        deleteCity,
        error,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

function useCities() {
  const context = useContext(CitiesContext);
  if (context === undefined)
    throw new Error("CitiesContext was used outside the CitiesProvider");
  return context;
}

export { CitiesProvider, useCities };
