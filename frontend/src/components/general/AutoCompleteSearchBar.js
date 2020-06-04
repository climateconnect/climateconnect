import React from "react"
import Autocomplete from "@material-ui/lab/Autocomplete"

export default function AutoCompleteSearchBar({profiles}){
  return (
    <Autocomplete 
      freeSolo
      options={profiles.map(p=>p.key=p.url_slug)}
    />
  )
}