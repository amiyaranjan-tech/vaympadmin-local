import { useState } from "react";

export function useBannerState() {
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState("all");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sort, setSort] = useState("priority");

  return {
    // values
    search,
    position,
    type,
    status,
    activeFilter,
    sort,

    // setters
    setSearch,
    setPosition,
    setType,
    setStatus,
    setActiveFilter,
    setSort,
  };
}
