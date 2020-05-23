import LocationOnOutlinedIcon from "@material-ui/icons/LocationOnOutlined";
import DoneAllOutlinedIcon from "@material-ui/icons/DoneAllOutlined";
import project_status_metadata from "./project_status_metadata";
import organization_types from "./organization_types.json";
import project_categories from "./project_categories.json";
import GroupIcon from "@material-ui/icons/Group";
import ExploreOutlinedIcon from "@material-ui/icons/ExploreOutlined";
import GroupAddIcon from "@material-ui/icons/GroupAdd";

export default {
  projects: [
    {
      icon: LocationOnOutlinedIcon,
      iconName: "LocationOnOutlinedIcon",
      title: "Location",
      type: "text",
      key: "location"
    },
    {
      icon: DoneAllOutlinedIcon,
      iconName: "DoneAllOutlinedIcon",
      title: "Status",
      type: "multiselect",
      options: project_status_metadata,
      key: "status"
    },
    {
      icon: GroupIcon,
      iconName: "GroupIcon",
      title: "Organization type",
      type: "multiselect",
      options: organization_types.organization_types,
      key: "organization_type"
    },
    {
      icon: ExploreOutlinedIcon,
      iconName: "ExploreOutlinedIcon",
      title: "Category",
      type: "multiselect",
      options: project_categories,
      key: "project_category"
    },
    {
      icon: GroupAddIcon,
      iconName: "GroupAddIcon",
      title: "Collaboration",
      type: "select",
      key: "collaboration",
      options: [
        {
          key: "yes",
          name: "yes"
        },
        {
          key: "no",
          name: "no"
        }
      ]
    }
  ],
  members: [
    {
      icon: LocationOnOutlinedIcon,
      iconName: "LocationOnOutlinedIcon",
      title: "Location",
      type: "text",
      key: "location"
    },
    {
      icon: DoneAllOutlinedIcon,
      iconName: "DoneAllOutlinedIcon",
      title: "Status",
      type: "multiselect",
      options: project_status_metadata,
      key: "status"
    },
    {
      icon: GroupIcon,
      iconName: "GroupIcon",
      title: "Organization type",
      type: "multiselect",
      options: organization_types.organization_types,
      key: "organization_type"
    },
    {
      icon: ExploreOutlinedIcon,
      iconName: "ExploreOutlinedIcon",
      title: "Category",
      type: "multiselect",
      options: project_categories,
      key: "project_category"
    },
    {
      icon: GroupAddIcon,
      iconName: "GroupAddIcon",
      title: "Collaboration",
      type: "select",
      key: "collaboration",
      options: [
        {
          key: "yes",
          name: "yes"
        },
        {
          key: "no",
          name: "no"
        }
      ]
    }
  ],
  organizations: [
    {
      icon: LocationOnOutlinedIcon,
      iconName: "LocationOnOutlinedIcon",
      title: "Location",
      type: "text",
      key: "location"
    },
    {
      icon: DoneAllOutlinedIcon,
      iconName: "DoneAllOutlinedIcon",
      title: "Status",
      type: "multiselect",
      options: project_status_metadata,
      key: "status"
    },
    {
      icon: GroupIcon,
      iconName: "GroupIcon",
      title: "Organization type",
      type: "multiselect",
      options: organization_types.organization_types,
      key: "organization_type"
    },
    {
      icon: ExploreOutlinedIcon,
      iconName: "ExploreOutlinedIcon",
      title: "Category",
      type: "multiselect",
      options: project_categories,
      key: "project_category"
    },
    {
      icon: GroupAddIcon,
      iconName: "GroupAddIcon",
      title: "Collaboration",
      type: "select",
      key: "collaboration",
      options: [
        {
          key: "yes",
          name: "yes"
        },
        {
          key: "no",
          name: "no"
        }
      ]
    }
  ]
};
