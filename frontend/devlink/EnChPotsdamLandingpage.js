"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _interactions from "./interactions";
import { QuoteWOCms } from "./QuoteWOCms";
import * as _utils from "./utils";
import _styles from "./EnChPotsdamLandingpage.module.css";

const _interactionsData = JSON.parse(
  '{"events":{"e-130":{"id":"e-130","name":"","animationType":"custom","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-131"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"bd0631ee-32f9-2804-f324-08690f7c3590","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"bd0631ee-32f9-2804-f324-08690f7c3590","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1698241822486},"e-131":{"id":"e-131","name":"","animationType":"custom","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-130"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"bd0631ee-32f9-2804-f324-08690f7c3590","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"bd0631ee-32f9-2804-f324-08690f7c3590","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1698241822488},"e-132":{"id":"e-132","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-133"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"bd0631ee-32f9-2804-f324-08690f7c35ba","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"bd0631ee-32f9-2804-f324-08690f7c35ba","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1698242422226},"e-133":{"id":"e-133","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-132"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"bd0631ee-32f9-2804-f324-08690f7c35ba","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"bd0631ee-32f9-2804-f324-08690f7c35ba","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1698242422226},"e-134":{"id":"e-134","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-135"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"bd0631ee-32f9-2804-f324-08690f7c35a4","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"bd0631ee-32f9-2804-f324-08690f7c35a4","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1698242422784},"e-135":{"id":"e-135","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-134"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"bd0631ee-32f9-2804-f324-08690f7c35a4","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"bd0631ee-32f9-2804-f324-08690f7c35a4","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1698242422784},"e-136":{"id":"e-136","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-137"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"bd0631ee-32f9-2804-f324-08690f7c359b","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"bd0631ee-32f9-2804-f324-08690f7c359b","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1698242423243},"e-137":{"id":"e-137","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-136"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"bd0631ee-32f9-2804-f324-08690f7c359b","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"bd0631ee-32f9-2804-f324-08690f7c359b","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1698242423243},"e-146":{"id":"e-146","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-147"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"bd0631ee-32f9-2804-f324-08690f7c35af","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"bd0631ee-32f9-2804-f324-08690f7c35af","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1698659490909},"e-147":{"id":"e-147","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-146"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"bd0631ee-32f9-2804-f324-08690f7c35af","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"bd0631ee-32f9-2804-f324-08690f7c35af","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1698659490909},"e-201":{"id":"e-201","name":"","animationType":"custom","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-202"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"b605d6e5-f794-423f-c1d7-680ccdf53517","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"b605d6e5-f794-423f-c1d7-680ccdf53517","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1698243192416},"e-202":{"id":"e-202","name":"","animationType":"custom","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-201"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"b605d6e5-f794-423f-c1d7-680ccdf53517","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"b605d6e5-f794-423f-c1d7-680ccdf53517","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":0,"direction":null,"effectIn":true},"createdOn":1698243192417},"e-203":{"id":"e-203","name":"","animationType":"custom","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-204"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"b605d6e5-f794-423f-c1d7-680ccdf53520","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"b605d6e5-f794-423f-c1d7-680ccdf53520","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1698243609892},"e-204":{"id":"e-204","name":"","animationType":"custom","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-203"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"b605d6e5-f794-423f-c1d7-680ccdf53520","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"b605d6e5-f794-423f-c1d7-680ccdf53520","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1698243609893},"e-205":{"id":"e-205","name":"","animationType":"custom","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-206"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"b605d6e5-f794-423f-c1d7-680ccdf53529","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"b605d6e5-f794-423f-c1d7-680ccdf53529","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1698243647464},"e-206":{"id":"e-206","name":"","animationType":"custom","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-205"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"b605d6e5-f794-423f-c1d7-680ccdf53529","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"b605d6e5-f794-423f-c1d7-680ccdf53529","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1698243647491},"e-261":{"id":"e-261","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-262"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"62611a5459ba108c4476f657|3e863cb7-6095-7e1c-94b5-c0bd4eff6254","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"62611a5459ba108c4476f657|3e863cb7-6095-7e1c-94b5-c0bd4eff6254","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1705572122758},"e-262":{"id":"e-262","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-261"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"62611a5459ba108c4476f657|3e863cb7-6095-7e1c-94b5-c0bd4eff6254","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"62611a5459ba108c4476f657|3e863cb7-6095-7e1c-94b5-c0bd4eff6254","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1705572122758},"e-263":{"id":"e-263","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-264"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"62611a5459ba108c4476f657|3e863cb7-6095-7e1c-94b5-c0bd4eff625d","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"62611a5459ba108c4476f657|3e863cb7-6095-7e1c-94b5-c0bd4eff625d","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1705572122758},"e-264":{"id":"e-264","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-263"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"62611a5459ba108c4476f657|3e863cb7-6095-7e1c-94b5-c0bd4eff625d","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"62611a5459ba108c4476f657|3e863cb7-6095-7e1c-94b5-c0bd4eff625d","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1705572122758},"e-265":{"id":"e-265","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-266"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"62611a5459ba108c4476f657|3e863cb7-6095-7e1c-94b5-c0bd4eff6266","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"62611a5459ba108c4476f657|3e863cb7-6095-7e1c-94b5-c0bd4eff6266","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1705572122758},"e-266":{"id":"e-266","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-265"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"62611a5459ba108c4476f657|3e863cb7-6095-7e1c-94b5-c0bd4eff6266","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"62611a5459ba108c4476f657|3e863cb7-6095-7e1c-94b5-c0bd4eff6266","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1705572122758},"e-267":{"id":"e-267","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-268"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"62611a5459ba108c4476f657|3e863cb7-6095-7e1c-94b5-c0bd4eff6271","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"62611a5459ba108c4476f657|3e863cb7-6095-7e1c-94b5-c0bd4eff6271","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1705572122758},"e-268":{"id":"e-268","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-267"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"62611a5459ba108c4476f657|3e863cb7-6095-7e1c-94b5-c0bd4eff6271","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"62611a5459ba108c4476f657|3e863cb7-6095-7e1c-94b5-c0bd4eff6271","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1705572122758},"e-269":{"id":"e-269","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-270"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"62611a5459ba108c4476f657|3e863cb7-6095-7e1c-94b5-c0bd4eff627c","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"62611a5459ba108c4476f657|3e863cb7-6095-7e1c-94b5-c0bd4eff627c","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1705572122758},"e-270":{"id":"e-270","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-269"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"62611a5459ba108c4476f657|3e863cb7-6095-7e1c-94b5-c0bd4eff627c","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"62611a5459ba108c4476f657|3e863cb7-6095-7e1c-94b5-c0bd4eff627c","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1705572122758},"e-271":{"id":"e-271","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-272"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"62611a5459ba108c4476f657|801ee2a1-4e75-4d8d-adea-7773731ef4a1","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"62611a5459ba108c4476f657|801ee2a1-4e75-4d8d-adea-7773731ef4a1","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1705573098049},"e-272":{"id":"e-272","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-271"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"62611a5459ba108c4476f657|801ee2a1-4e75-4d8d-adea-7773731ef4a1","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"62611a5459ba108c4476f657|801ee2a1-4e75-4d8d-adea-7773731ef4a1","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1705573098049},"e-275":{"id":"e-275","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-276"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"654b432247005c93ed4104d6|30137e44-8e03-affa-db73-e6885a20b7c9","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"654b432247005c93ed4104d6|30137e44-8e03-affa-db73-e6885a20b7c9","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1705612890494},"e-276":{"id":"e-276","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-275"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"654b432247005c93ed4104d6|30137e44-8e03-affa-db73-e6885a20b7c9","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"654b432247005c93ed4104d6|30137e44-8e03-affa-db73-e6885a20b7c9","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":0,"direction":null,"effectIn":true},"createdOn":1705612890494},"e-281":{"id":"e-281","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-282"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"654b432247005c93ed4104d6|30137e44-8e03-affa-db73-e6885a20b7d2","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"654b432247005c93ed4104d6|30137e44-8e03-affa-db73-e6885a20b7d2","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1705612890494},"e-282":{"id":"e-282","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-281"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"654b432247005c93ed4104d6|30137e44-8e03-affa-db73-e6885a20b7d2","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"654b432247005c93ed4104d6|30137e44-8e03-affa-db73-e6885a20b7d2","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1705612890494},"e-289":{"id":"e-289","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-290"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"654b432247005c93ed4104d6|30137e44-8e03-affa-db73-e6885a20b7db","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"654b432247005c93ed4104d6|30137e44-8e03-affa-db73-e6885a20b7db","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1705612890494},"e-290":{"id":"e-290","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-289"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"654b432247005c93ed4104d6|30137e44-8e03-affa-db73-e6885a20b7db","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"654b432247005c93ed4104d6|30137e44-8e03-affa-db73-e6885a20b7db","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1705612890494},"e-291":{"id":"e-291","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-292"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"654b432247005c93ed4104d6|30137e44-8e03-affa-db73-e6885a20b7f6","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"654b432247005c93ed4104d6|30137e44-8e03-affa-db73-e6885a20b7f6","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1705612890494},"e-292":{"id":"e-292","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-291"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"654b432247005c93ed4104d6|30137e44-8e03-affa-db73-e6885a20b7f6","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"654b432247005c93ed4104d6|30137e44-8e03-affa-db73-e6885a20b7f6","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1705612890494},"e-293":{"id":"e-293","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-294"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"654b432247005c93ed4104d6|30137e44-8e03-affa-db73-e6885a20b801","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"654b432247005c93ed4104d6|30137e44-8e03-affa-db73-e6885a20b801","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1705612890494},"e-294":{"id":"e-294","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-293"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"654b432247005c93ed4104d6|30137e44-8e03-affa-db73-e6885a20b801","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"654b432247005c93ed4104d6|30137e44-8e03-affa-db73-e6885a20b801","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1705612890494},"e-295":{"id":"e-295","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-296"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"654b432247005c93ed4104d6|30137e44-8e03-affa-db73-e6885a20b80c","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"654b432247005c93ed4104d6|30137e44-8e03-affa-db73-e6885a20b80c","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1705612890494},"e-296":{"id":"e-296","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-295"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"654b432247005c93ed4104d6|30137e44-8e03-affa-db73-e6885a20b80c","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"654b432247005c93ed4104d6|30137e44-8e03-affa-db73-e6885a20b80c","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1705612890494},"e-297":{"id":"e-297","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-298"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"654b432247005c93ed4104d6|30137e44-8e03-affa-db73-e6885a20b815","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"654b432247005c93ed4104d6|30137e44-8e03-affa-db73-e6885a20b815","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1705612890494},"e-298":{"id":"e-298","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-297"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"654b432247005c93ed4104d6|30137e44-8e03-affa-db73-e6885a20b815","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"654b432247005c93ed4104d6|30137e44-8e03-affa-db73-e6885a20b815","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1705612890494},"e-299":{"id":"e-299","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-300"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"654b432247005c93ed4104d6|30137e44-8e03-affa-db73-e6885a20b81e","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"654b432247005c93ed4104d6|30137e44-8e03-affa-db73-e6885a20b81e","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1705612890494},"e-300":{"id":"e-300","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-299"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"654b432247005c93ed4104d6|30137e44-8e03-affa-db73-e6885a20b81e","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"654b432247005c93ed4104d6|30137e44-8e03-affa-db73-e6885a20b81e","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1705612890494},"e-301":{"id":"e-301","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-302"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"654b432247005c93ed4104d6|30137e44-8e03-affa-db73-e6885a20b829","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"654b432247005c93ed4104d6|30137e44-8e03-affa-db73-e6885a20b829","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1705612890494},"e-302":{"id":"e-302","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-301"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"654b432247005c93ed4104d6|30137e44-8e03-affa-db73-e6885a20b829","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"654b432247005c93ed4104d6|30137e44-8e03-affa-db73-e6885a20b829","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1705612890494},"e-339":{"id":"e-339","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-340"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"9e9ef8bb-7616-7852-6364-2fbe948cbc3b","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"9e9ef8bb-7616-7852-6364-2fbe948cbc3b","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1705669682275},"e-340":{"id":"e-340","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-339"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"9e9ef8bb-7616-7852-6364-2fbe948cbc3b","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"9e9ef8bb-7616-7852-6364-2fbe948cbc3b","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1705669682275},"e-341":{"id":"e-341","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-342"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"9e9ef8bb-7616-7852-6364-2fbe948cbc65","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"9e9ef8bb-7616-7852-6364-2fbe948cbc65","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1705669682275},"e-342":{"id":"e-342","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-341"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"9e9ef8bb-7616-7852-6364-2fbe948cbc65","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"9e9ef8bb-7616-7852-6364-2fbe948cbc65","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1705669682275},"e-343":{"id":"e-343","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-344"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"9e9ef8bb-7616-7852-6364-2fbe948cbc4f","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"9e9ef8bb-7616-7852-6364-2fbe948cbc4f","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1705669682275},"e-344":{"id":"e-344","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-343"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"9e9ef8bb-7616-7852-6364-2fbe948cbc4f","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"9e9ef8bb-7616-7852-6364-2fbe948cbc4f","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1705669682275},"e-345":{"id":"e-345","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-346"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"9e9ef8bb-7616-7852-6364-2fbe948cbc46","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"9e9ef8bb-7616-7852-6364-2fbe948cbc46","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1705669682275},"e-346":{"id":"e-346","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-345"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"9e9ef8bb-7616-7852-6364-2fbe948cbc46","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"9e9ef8bb-7616-7852-6364-2fbe948cbc46","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1705669682275},"e-355":{"id":"e-355","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-356"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"9e9ef8bb-7616-7852-6364-2fbe948cbc5a","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"9e9ef8bb-7616-7852-6364-2fbe948cbc5a","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1705669682275},"e-356":{"id":"e-356","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-355"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"9e9ef8bb-7616-7852-6364-2fbe948cbc5a","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"9e9ef8bb-7616-7852-6364-2fbe948cbc5a","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1705669682275},"e-387":{"id":"e-387","name":"","animationType":"custom","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-388"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"fd2efba1-73c9-c87b-3b64-8f3f11315142","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"fd2efba1-73c9-c87b-3b64-8f3f11315142","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1706787127405},"e-388":{"id":"e-388","name":"","animationType":"custom","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-387"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"fd2efba1-73c9-c87b-3b64-8f3f11315142","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"fd2efba1-73c9-c87b-3b64-8f3f11315142","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1706787127407},"e-389":{"id":"e-389","name":"","animationType":"custom","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-390"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"fd2efba1-73c9-c87b-3b64-8f3f1131514d","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"fd2efba1-73c9-c87b-3b64-8f3f1131514d","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1706787198622},"e-390":{"id":"e-390","name":"","animationType":"custom","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-389"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"fd2efba1-73c9-c87b-3b64-8f3f1131514d","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"fd2efba1-73c9-c87b-3b64-8f3f1131514d","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1706787198624},"e-391":{"id":"e-391","name":"","animationType":"custom","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-392"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"fd2efba1-73c9-c87b-3b64-8f3f11315156","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"fd2efba1-73c9-c87b-3b64-8f3f11315156","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1706787213701},"e-392":{"id":"e-392","name":"","animationType":"custom","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-391"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"fd2efba1-73c9-c87b-3b64-8f3f11315156","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"fd2efba1-73c9-c87b-3b64-8f3f11315156","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1706787213703},"e-393":{"id":"e-393","name":"","animationType":"custom","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-394"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"fd2efba1-73c9-c87b-3b64-8f3f11315161","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"fd2efba1-73c9-c87b-3b64-8f3f11315161","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1706787228996},"e-394":{"id":"e-394","name":"","animationType":"custom","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-393"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"fd2efba1-73c9-c87b-3b64-8f3f11315161","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"fd2efba1-73c9-c87b-3b64-8f3f11315161","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1706787228998},"e-395":{"id":"e-395","name":"","animationType":"custom","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-396"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"fd2efba1-73c9-c87b-3b64-8f3f1131516c","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"fd2efba1-73c9-c87b-3b64-8f3f1131516c","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1706787243482},"e-396":{"id":"e-396","name":"","animationType":"custom","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-395"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"fd2efba1-73c9-c87b-3b64-8f3f1131516c","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"fd2efba1-73c9-c87b-3b64-8f3f1131516c","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1706787243486},"e-401":{"id":"e-401","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-402"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"62611a5459ba1002c876f662|ea313190-48a3-cfe7-5d0f-27b18c9ff8f5","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"62611a5459ba1002c876f662|ea313190-48a3-cfe7-5d0f-27b18c9ff8f5","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1706876418739},"e-402":{"id":"e-402","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-401"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"62611a5459ba1002c876f662|ea313190-48a3-cfe7-5d0f-27b18c9ff8f5","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"62611a5459ba1002c876f662|ea313190-48a3-cfe7-5d0f-27b18c9ff8f5","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":0,"direction":null,"effectIn":true},"createdOn":1706876418739},"e-407":{"id":"e-407","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-408"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"62611a5459ba1002c876f662|ea313190-48a3-cfe7-5d0f-27b18c9ff8fe","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"62611a5459ba1002c876f662|ea313190-48a3-cfe7-5d0f-27b18c9ff8fe","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1706876418739},"e-408":{"id":"e-408","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-407"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"62611a5459ba1002c876f662|ea313190-48a3-cfe7-5d0f-27b18c9ff8fe","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"62611a5459ba1002c876f662|ea313190-48a3-cfe7-5d0f-27b18c9ff8fe","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1706876418739},"e-415":{"id":"e-415","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-416"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"62611a5459ba1002c876f662|ea313190-48a3-cfe7-5d0f-27b18c9ff907","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"62611a5459ba1002c876f662|ea313190-48a3-cfe7-5d0f-27b18c9ff907","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1706876418739},"e-416":{"id":"e-416","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-415"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"62611a5459ba1002c876f662|ea313190-48a3-cfe7-5d0f-27b18c9ff907","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"62611a5459ba1002c876f662|ea313190-48a3-cfe7-5d0f-27b18c9ff907","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1706876418739},"e-417":{"id":"e-417","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-418"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"62611a5459ba1002c876f662|ea313190-48a3-cfe7-5d0f-27b18c9ff922","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"62611a5459ba1002c876f662|ea313190-48a3-cfe7-5d0f-27b18c9ff922","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1706876418739},"e-418":{"id":"e-418","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-417"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"62611a5459ba1002c876f662|ea313190-48a3-cfe7-5d0f-27b18c9ff922","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"62611a5459ba1002c876f662|ea313190-48a3-cfe7-5d0f-27b18c9ff922","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1706876418739},"e-419":{"id":"e-419","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-420"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"62611a5459ba1002c876f662|ea313190-48a3-cfe7-5d0f-27b18c9ff92d","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"62611a5459ba1002c876f662|ea313190-48a3-cfe7-5d0f-27b18c9ff92d","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1706876418739},"e-420":{"id":"e-420","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-419"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"62611a5459ba1002c876f662|ea313190-48a3-cfe7-5d0f-27b18c9ff92d","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"62611a5459ba1002c876f662|ea313190-48a3-cfe7-5d0f-27b18c9ff92d","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1706876418739},"e-421":{"id":"e-421","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-422"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"62611a5459ba1002c876f662|ea313190-48a3-cfe7-5d0f-27b18c9ff938","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"62611a5459ba1002c876f662|ea313190-48a3-cfe7-5d0f-27b18c9ff938","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1706876418739},"e-422":{"id":"e-422","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-421"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"62611a5459ba1002c876f662|ea313190-48a3-cfe7-5d0f-27b18c9ff938","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"62611a5459ba1002c876f662|ea313190-48a3-cfe7-5d0f-27b18c9ff938","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1706876418739},"e-423":{"id":"e-423","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-424"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"62611a5459ba1002c876f662|ea313190-48a3-cfe7-5d0f-27b18c9ff941","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"62611a5459ba1002c876f662|ea313190-48a3-cfe7-5d0f-27b18c9ff941","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1706876418739},"e-424":{"id":"e-424","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-423"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"62611a5459ba1002c876f662|ea313190-48a3-cfe7-5d0f-27b18c9ff941","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"62611a5459ba1002c876f662|ea313190-48a3-cfe7-5d0f-27b18c9ff941","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1706876418739},"e-425":{"id":"e-425","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-426"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"62611a5459ba1002c876f662|ea313190-48a3-cfe7-5d0f-27b18c9ff94a","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"62611a5459ba1002c876f662|ea313190-48a3-cfe7-5d0f-27b18c9ff94a","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1706876418739},"e-426":{"id":"e-426","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-425"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"62611a5459ba1002c876f662|ea313190-48a3-cfe7-5d0f-27b18c9ff94a","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"62611a5459ba1002c876f662|ea313190-48a3-cfe7-5d0f-27b18c9ff94a","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1706876418739},"e-427":{"id":"e-427","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-428"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"62611a5459ba1002c876f662|ea313190-48a3-cfe7-5d0f-27b18c9ff955","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"62611a5459ba1002c876f662|ea313190-48a3-cfe7-5d0f-27b18c9ff955","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1706876418739},"e-428":{"id":"e-428","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-427"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"62611a5459ba1002c876f662|ea313190-48a3-cfe7-5d0f-27b18c9ff955","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"62611a5459ba1002c876f662|ea313190-48a3-cfe7-5d0f-27b18c9ff955","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1706876418739},"e-430":{"id":"e-430","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-431"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"ed0de107-cdbe-babf-7028-2ebe7cb54315","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"ed0de107-cdbe-babf-7028-2ebe7cb54315","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1707116910375},"e-431":{"id":"e-431","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-430"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"ed0de107-cdbe-babf-7028-2ebe7cb54315","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"ed0de107-cdbe-babf-7028-2ebe7cb54315","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1707116910375},"e-432":{"id":"e-432","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-433"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"ed0de107-cdbe-babf-7028-2ebe7cb5433f","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"ed0de107-cdbe-babf-7028-2ebe7cb5433f","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1707116910375},"e-433":{"id":"e-433","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-432"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"ed0de107-cdbe-babf-7028-2ebe7cb5433f","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"ed0de107-cdbe-babf-7028-2ebe7cb5433f","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1707116910375},"e-434":{"id":"e-434","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-435"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"ed0de107-cdbe-babf-7028-2ebe7cb54329","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"ed0de107-cdbe-babf-7028-2ebe7cb54329","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1707116910375},"e-435":{"id":"e-435","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-434"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"ed0de107-cdbe-babf-7028-2ebe7cb54329","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"ed0de107-cdbe-babf-7028-2ebe7cb54329","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1707116910375},"e-436":{"id":"e-436","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-437"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"ed0de107-cdbe-babf-7028-2ebe7cb54320","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"ed0de107-cdbe-babf-7028-2ebe7cb54320","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1707116910375},"e-437":{"id":"e-437","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-436"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"ed0de107-cdbe-babf-7028-2ebe7cb54320","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"ed0de107-cdbe-babf-7028-2ebe7cb54320","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1707116910375},"e-446":{"id":"e-446","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-447"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"ed0de107-cdbe-babf-7028-2ebe7cb54334","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"ed0de107-cdbe-babf-7028-2ebe7cb54334","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1707116910375},"e-447":{"id":"e-447","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-446"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"ed0de107-cdbe-babf-7028-2ebe7cb54334","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"ed0de107-cdbe-babf-7028-2ebe7cb54334","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1707116910375},"e-454":{"id":"e-454","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-455"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"ed0de107-cdbe-babf-7028-2ebe7cb541fe","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"ed0de107-cdbe-babf-7028-2ebe7cb541fe","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1707116910375},"e-455":{"id":"e-455","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-454"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"ed0de107-cdbe-babf-7028-2ebe7cb541fe","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"ed0de107-cdbe-babf-7028-2ebe7cb541fe","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":0,"direction":null,"effectIn":true},"createdOn":1707116910375},"e-456":{"id":"e-456","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-457"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"ed0de107-cdbe-babf-7028-2ebe7cb54207","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"ed0de107-cdbe-babf-7028-2ebe7cb54207","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1707116910375},"e-457":{"id":"e-457","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-456"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"ed0de107-cdbe-babf-7028-2ebe7cb54207","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"ed0de107-cdbe-babf-7028-2ebe7cb54207","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1707116910375},"e-458":{"id":"e-458","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-459"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"ed0de107-cdbe-babf-7028-2ebe7cb54210","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"ed0de107-cdbe-babf-7028-2ebe7cb54210","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1707116910375},"e-459":{"id":"e-459","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-458"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"ed0de107-cdbe-babf-7028-2ebe7cb54210","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"ed0de107-cdbe-babf-7028-2ebe7cb54210","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1707116910375},"e-464":{"id":"e-464","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-465"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"ed0de107-cdbe-babf-7028-2ebe7cb54225","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"ed0de107-cdbe-babf-7028-2ebe7cb54225","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1707116910375},"e-465":{"id":"e-465","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-464"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"ed0de107-cdbe-babf-7028-2ebe7cb54225","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"ed0de107-cdbe-babf-7028-2ebe7cb54225","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":0,"direction":null,"effectIn":true},"createdOn":1707116910375},"e-466":{"id":"e-466","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-467"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"ed0de107-cdbe-babf-7028-2ebe7cb5422e","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"ed0de107-cdbe-babf-7028-2ebe7cb5422e","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1707116910375},"e-467":{"id":"e-467","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-466"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"ed0de107-cdbe-babf-7028-2ebe7cb5422e","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"ed0de107-cdbe-babf-7028-2ebe7cb5422e","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1707116910375},"e-476":{"id":"e-476","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-477"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"ed0de107-cdbe-babf-7028-2ebe7cb54237","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"ed0de107-cdbe-babf-7028-2ebe7cb54237","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1707116910375},"e-477":{"id":"e-477","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-476"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"ed0de107-cdbe-babf-7028-2ebe7cb54237","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"ed0de107-cdbe-babf-7028-2ebe7cb54237","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1707116910375},"e-483":{"id":"e-483","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-484"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"9d5595e3-742e-a0fc-b13d-fcab993594da","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"9d5595e3-742e-a0fc-b13d-fcab993594da","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1714489671038},"e-484":{"id":"e-484","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-483"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"9d5595e3-742e-a0fc-b13d-fcab993594da","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"9d5595e3-742e-a0fc-b13d-fcab993594da","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1714489671038},"e-485":{"id":"e-485","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-486"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"9d5595e3-742e-a0fc-b13d-fcab99359504","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"9d5595e3-742e-a0fc-b13d-fcab99359504","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1714489671038},"e-486":{"id":"e-486","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-485"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"9d5595e3-742e-a0fc-b13d-fcab99359504","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"9d5595e3-742e-a0fc-b13d-fcab99359504","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1714489671038},"e-487":{"id":"e-487","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-488"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"9d5595e3-742e-a0fc-b13d-fcab993594ee","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"9d5595e3-742e-a0fc-b13d-fcab993594ee","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1714489671038},"e-488":{"id":"e-488","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-487"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"9d5595e3-742e-a0fc-b13d-fcab993594ee","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"9d5595e3-742e-a0fc-b13d-fcab993594ee","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1714489671038},"e-489":{"id":"e-489","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-490"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"9d5595e3-742e-a0fc-b13d-fcab993594e5","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"9d5595e3-742e-a0fc-b13d-fcab993594e5","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1714489671038},"e-490":{"id":"e-490","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-489"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"9d5595e3-742e-a0fc-b13d-fcab993594e5","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"9d5595e3-742e-a0fc-b13d-fcab993594e5","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1714489671038},"e-499":{"id":"e-499","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-52","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-500"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"9d5595e3-742e-a0fc-b13d-fcab993594f9","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"9d5595e3-742e-a0fc-b13d-fcab993594f9","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1714489671038},"e-500":{"id":"e-500","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-53","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-499"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"9d5595e3-742e-a0fc-b13d-fcab993594f9","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"9d5595e3-742e-a0fc-b13d-fcab993594f9","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1714489671038},"e-507":{"id":"e-507","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-508"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"9d5595e3-742e-a0fc-b13d-fcab993593bf","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"9d5595e3-742e-a0fc-b13d-fcab993593bf","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1714489671038},"e-508":{"id":"e-508","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-507"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"9d5595e3-742e-a0fc-b13d-fcab993593bf","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"9d5595e3-742e-a0fc-b13d-fcab993593bf","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":0,"direction":null,"effectIn":true},"createdOn":1714489671038},"e-509":{"id":"e-509","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-510"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"9d5595e3-742e-a0fc-b13d-fcab993593c8","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"9d5595e3-742e-a0fc-b13d-fcab993593c8","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1714489671038},"e-510":{"id":"e-510","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-509"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"9d5595e3-742e-a0fc-b13d-fcab993593c8","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"9d5595e3-742e-a0fc-b13d-fcab993593c8","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1714489671038},"e-511":{"id":"e-511","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-512"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"9d5595e3-742e-a0fc-b13d-fcab993593d1","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"9d5595e3-742e-a0fc-b13d-fcab993593d1","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1714489671038},"e-512":{"id":"e-512","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-511"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"9d5595e3-742e-a0fc-b13d-fcab993593d1","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"9d5595e3-742e-a0fc-b13d-fcab993593d1","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1714489671038},"e-517":{"id":"e-517","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-518"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"9d5595e3-742e-a0fc-b13d-fcab993593e6","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"9d5595e3-742e-a0fc-b13d-fcab993593e6","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1714489671038},"e-518":{"id":"e-518","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-517"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"9d5595e3-742e-a0fc-b13d-fcab993593e6","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"9d5595e3-742e-a0fc-b13d-fcab993593e6","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":0,"direction":null,"effectIn":true},"createdOn":1714489671038},"e-519":{"id":"e-519","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-520"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"9d5595e3-742e-a0fc-b13d-fcab993593ef","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"9d5595e3-742e-a0fc-b13d-fcab993593ef","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1714489671038},"e-520":{"id":"e-520","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-519"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"9d5595e3-742e-a0fc-b13d-fcab993593ef","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"9d5595e3-742e-a0fc-b13d-fcab993593ef","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1714489671038},"e-529":{"id":"e-529","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-530"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"9d5595e3-742e-a0fc-b13d-fcab993593f8","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"9d5595e3-742e-a0fc-b13d-fcab993593f8","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1714489671038},"e-530":{"id":"e-530","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-529"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"9d5595e3-742e-a0fc-b13d-fcab993593f8","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"9d5595e3-742e-a0fc-b13d-fcab993593f8","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1714489671038},"e-532":{"id":"e-532","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-77","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-533"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e281344","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e281344","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715159298448},"e-533":{"id":"e-533","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-78","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-532"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e281344","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e281344","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":0,"direction":null,"effectIn":true},"createdOn":1715159298448},"e-534":{"id":"e-534","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-79","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-535"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e281344","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e281344","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715159298448},"e-535":{"id":"e-535","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-80","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-534"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e281344","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e281344","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":0,"direction":null,"effectIn":true},"createdOn":1715159298448},"e-536":{"id":"e-536","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-77","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-537"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e281344","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e281344","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715159298448},"e-537":{"id":"e-537","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-78","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-536"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e281344","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e281344","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":0,"direction":null,"effectIn":true},"createdOn":1715159298448},"e-538":{"id":"e-538","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-79","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-539"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e28134d","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e28134d","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715159298448},"e-539":{"id":"e-539","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-80","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-538"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e28134d","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e28134d","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715159298448},"e-540":{"id":"e-540","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-77","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-541"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e28134d","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e28134d","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715159298448},"e-541":{"id":"e-541","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-78","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-540"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e28134d","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e28134d","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715159298448},"e-542":{"id":"e-542","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-77","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-543"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e28134d","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e28134d","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715159298448},"e-543":{"id":"e-543","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-78","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-542"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e28134d","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e28134d","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715159298448},"e-544":{"id":"e-544","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-79","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-545"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e281356","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e281356","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715159298448},"e-545":{"id":"e-545","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-80","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-544"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e281356","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e281356","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715159298448},"e-546":{"id":"e-546","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-77","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-547"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e281356","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e281356","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715159298448},"e-547":{"id":"e-547","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-78","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-546"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e281356","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e281356","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715159298448},"e-548":{"id":"e-548","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-77","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-549"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e281356","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e281356","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715159298448},"e-549":{"id":"e-549","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-78","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-548"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e281356","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e281356","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715159298448},"e-550":{"id":"e-550","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-77","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-551"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e28136b","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e28136b","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715159298448},"e-551":{"id":"e-551","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-78","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-550"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e28136b","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e28136b","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":0,"direction":null,"effectIn":true},"createdOn":1715159298448},"e-552":{"id":"e-552","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-77","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-553"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e28136b","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e28136b","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715159298448},"e-553":{"id":"e-553","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-78","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-552"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e28136b","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e28136b","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":0,"direction":null,"effectIn":true},"createdOn":1715159298448},"e-554":{"id":"e-554","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-79","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-555"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e28136b","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e28136b","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715159298448},"e-555":{"id":"e-555","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-80","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-554"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e28136b","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e28136b","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":0,"direction":null,"effectIn":true},"createdOn":1715159298448},"e-556":{"id":"e-556","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-77","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-557"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e281374","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e281374","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715159298448},"e-557":{"id":"e-557","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-78","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-556"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e281374","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e281374","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715159298448},"e-558":{"id":"e-558","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-77","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-559"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e281374","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e281374","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715159298448},"e-559":{"id":"e-559","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-78","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-558"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e281374","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e281374","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715159298448},"e-560":{"id":"e-560","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-79","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-561"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e281374","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e281374","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715159298448},"e-561":{"id":"e-561","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-80","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-560"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e281374","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e281374","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715159298448},"e-562":{"id":"e-562","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-79","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-563"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e28137d","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e28137d","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715159298448},"e-563":{"id":"e-563","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-80","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-562"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e28137d","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e28137d","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715159298448},"e-564":{"id":"e-564","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-77","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-565"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e28137d","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e28137d","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715159298448},"e-565":{"id":"e-565","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-78","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-564"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e28137d","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e28137d","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715159298448},"e-566":{"id":"e-566","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-77","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-567"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e28137d","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e28137d","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715159298448},"e-567":{"id":"e-567","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-78","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-566"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e28137d","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e28137d","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715159298448},"e-568":{"id":"e-568","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-81","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-569"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e28145d","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e28145d","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715159298448},"e-569":{"id":"e-569","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-82","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-568"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e28145d","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e28145d","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715159298448},"e-570":{"id":"e-570","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-81","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-571"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e281468","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e281468","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715159298448},"e-571":{"id":"e-571","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-82","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-570"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e281468","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e281468","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715159298448},"e-572":{"id":"e-572","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-81","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-573"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e281471","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e281471","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715159298448},"e-573":{"id":"e-573","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-82","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-572"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e281471","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e281471","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715159298448},"e-574":{"id":"e-574","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-81","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-575"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e28147c","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e28147c","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715159298448},"e-575":{"id":"e-575","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-82","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-574"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e28147c","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e28147c","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715159298448},"e-576":{"id":"e-576","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-81","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-577"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e281487","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e281487","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715159298448},"e-577":{"id":"e-577","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-82","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-576"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"71839a0b-710d-2111-871f-d06c7e281487","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"71839a0b-710d-2111-871f-d06c7e281487","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715159298448},"e-580":{"id":"e-580","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-84","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-581"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"da58ea3c-2eb2-c566-047d-c45a1b753fe7","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"da58ea3c-2eb2-c566-047d-c45a1b753fe7","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715164561698},"e-581":{"id":"e-581","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-85","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-580"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"da58ea3c-2eb2-c566-047d-c45a1b753fe7","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"da58ea3c-2eb2-c566-047d-c45a1b753fe7","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715164561698},"e-582":{"id":"e-582","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-84","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-583"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"da58ea3c-2eb2-c566-047d-c45a1b754011","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"da58ea3c-2eb2-c566-047d-c45a1b754011","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715164561698},"e-583":{"id":"e-583","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-85","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-582"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"da58ea3c-2eb2-c566-047d-c45a1b754011","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"da58ea3c-2eb2-c566-047d-c45a1b754011","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715164561698},"e-584":{"id":"e-584","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-84","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-585"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"da58ea3c-2eb2-c566-047d-c45a1b753ffb","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"da58ea3c-2eb2-c566-047d-c45a1b753ffb","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715164561698},"e-585":{"id":"e-585","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-85","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-584"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"da58ea3c-2eb2-c566-047d-c45a1b753ffb","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"da58ea3c-2eb2-c566-047d-c45a1b753ffb","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715164561698},"e-586":{"id":"e-586","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-84","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-587"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"da58ea3c-2eb2-c566-047d-c45a1b753ff2","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"da58ea3c-2eb2-c566-047d-c45a1b753ff2","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715164561698},"e-587":{"id":"e-587","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-85","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-586"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"da58ea3c-2eb2-c566-047d-c45a1b753ff2","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"da58ea3c-2eb2-c566-047d-c45a1b753ff2","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715164561698},"e-594":{"id":"e-594","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-84","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-595"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"da58ea3c-2eb2-c566-047d-c45a1b754006","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"da58ea3c-2eb2-c566-047d-c45a1b754006","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715164561698},"e-595":{"id":"e-595","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-85","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-594"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"da58ea3c-2eb2-c566-047d-c45a1b754006","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"da58ea3c-2eb2-c566-047d-c45a1b754006","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715164561698},"e-602":{"id":"e-602","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-88","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-603"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"da58ea3c-2eb2-c566-047d-c45a1b753ecc","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"da58ea3c-2eb2-c566-047d-c45a1b753ecc","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715164561698},"e-603":{"id":"e-603","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-89","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-602"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"da58ea3c-2eb2-c566-047d-c45a1b753ecc","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"da58ea3c-2eb2-c566-047d-c45a1b753ecc","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":0,"direction":null,"effectIn":true},"createdOn":1715164561698},"e-604":{"id":"e-604","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-88","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-605"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"da58ea3c-2eb2-c566-047d-c45a1b753ed5","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"da58ea3c-2eb2-c566-047d-c45a1b753ed5","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715164561698},"e-605":{"id":"e-605","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-89","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-604"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"da58ea3c-2eb2-c566-047d-c45a1b753ed5","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"da58ea3c-2eb2-c566-047d-c45a1b753ed5","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715164561698},"e-606":{"id":"e-606","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-88","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-607"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"da58ea3c-2eb2-c566-047d-c45a1b753ede","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"da58ea3c-2eb2-c566-047d-c45a1b753ede","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715164561698},"e-607":{"id":"e-607","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-89","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-606"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"da58ea3c-2eb2-c566-047d-c45a1b753ede","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"da58ea3c-2eb2-c566-047d-c45a1b753ede","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715164561698},"e-612":{"id":"e-612","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-88","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-613"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"da58ea3c-2eb2-c566-047d-c45a1b753ef3","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"da58ea3c-2eb2-c566-047d-c45a1b753ef3","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715164561698},"e-613":{"id":"e-613","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-89","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-612"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"da58ea3c-2eb2-c566-047d-c45a1b753ef3","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"da58ea3c-2eb2-c566-047d-c45a1b753ef3","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":0,"direction":null,"effectIn":true},"createdOn":1715164561698},"e-614":{"id":"e-614","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-88","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-615"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"da58ea3c-2eb2-c566-047d-c45a1b753efc","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"da58ea3c-2eb2-c566-047d-c45a1b753efc","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715164561698},"e-615":{"id":"e-615","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-89","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-614"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"da58ea3c-2eb2-c566-047d-c45a1b753efc","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"da58ea3c-2eb2-c566-047d-c45a1b753efc","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715164561698},"e-624":{"id":"e-624","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-88","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-625"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"da58ea3c-2eb2-c566-047d-c45a1b753f05","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"da58ea3c-2eb2-c566-047d-c45a1b753f05","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715164561698},"e-625":{"id":"e-625","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-89","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-624"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"da58ea3c-2eb2-c566-047d-c45a1b753f05","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"da58ea3c-2eb2-c566-047d-c45a1b753f05","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715164561698},"e-626":{"id":"e-626","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-627"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"65c0ff603d80ee6dd2de6f5d|a33236f8-fbbe-3ae6-9cfd-b56fc9149db3","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"65c0ff603d80ee6dd2de6f5d|a33236f8-fbbe-3ae6-9cfd-b56fc9149db3","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715952679978},"e-627":{"id":"e-627","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-626"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"65c0ff603d80ee6dd2de6f5d|a33236f8-fbbe-3ae6-9cfd-b56fc9149db3","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"65c0ff603d80ee6dd2de6f5d|a33236f8-fbbe-3ae6-9cfd-b56fc9149db3","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":0,"direction":null,"effectIn":true},"createdOn":1715952679978},"e-636":{"id":"e-636","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-637"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"65c0ff603d80ee6dd2de6f5d|a33236f8-fbbe-3ae6-9cfd-b56fc9149dbc","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"65c0ff603d80ee6dd2de6f5d|a33236f8-fbbe-3ae6-9cfd-b56fc9149dbc","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715952679978},"e-637":{"id":"e-637","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-636"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"65c0ff603d80ee6dd2de6f5d|a33236f8-fbbe-3ae6-9cfd-b56fc9149dbc","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"65c0ff603d80ee6dd2de6f5d|a33236f8-fbbe-3ae6-9cfd-b56fc9149dbc","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715952679978},"e-638":{"id":"e-638","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-639"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"65c0ff603d80ee6dd2de6f5d|a33236f8-fbbe-3ae6-9cfd-b56fc9149dc5","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"65c0ff603d80ee6dd2de6f5d|a33236f8-fbbe-3ae6-9cfd-b56fc9149dc5","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715952679978},"e-639":{"id":"e-639","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-638"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"65c0ff603d80ee6dd2de6f5d|a33236f8-fbbe-3ae6-9cfd-b56fc9149dc5","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"65c0ff603d80ee6dd2de6f5d|a33236f8-fbbe-3ae6-9cfd-b56fc9149dc5","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715952679978},"e-646":{"id":"e-646","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-647"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"65c0ff603d80ee6dd2de6f5d|a33236f8-fbbe-3ae6-9cfd-b56fc9149dda","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"65c0ff603d80ee6dd2de6f5d|a33236f8-fbbe-3ae6-9cfd-b56fc9149dda","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715952679978},"e-647":{"id":"e-647","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-646"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"65c0ff603d80ee6dd2de6f5d|a33236f8-fbbe-3ae6-9cfd-b56fc9149dda","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"65c0ff603d80ee6dd2de6f5d|a33236f8-fbbe-3ae6-9cfd-b56fc9149dda","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":0,"direction":null,"effectIn":true},"createdOn":1715952679978},"e-654":{"id":"e-654","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-655"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"65c0ff603d80ee6dd2de6f5d|a33236f8-fbbe-3ae6-9cfd-b56fc9149de3","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"65c0ff603d80ee6dd2de6f5d|a33236f8-fbbe-3ae6-9cfd-b56fc9149de3","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715952679978},"e-655":{"id":"e-655","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-654"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"65c0ff603d80ee6dd2de6f5d|a33236f8-fbbe-3ae6-9cfd-b56fc9149de3","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"65c0ff603d80ee6dd2de6f5d|a33236f8-fbbe-3ae6-9cfd-b56fc9149de3","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715952679978},"e-660":{"id":"e-660","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-661"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"65c0ff603d80ee6dd2de6f5d|a33236f8-fbbe-3ae6-9cfd-b56fc9149dec","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"65c0ff603d80ee6dd2de6f5d|a33236f8-fbbe-3ae6-9cfd-b56fc9149dec","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715952679978},"e-661":{"id":"e-661","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-660"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"65c0ff603d80ee6dd2de6f5d|a33236f8-fbbe-3ae6-9cfd-b56fc9149dec","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"65c0ff603d80ee6dd2de6f5d|a33236f8-fbbe-3ae6-9cfd-b56fc9149dec","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715952679978},"e-682":{"id":"e-682","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-683"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"65c0ff603d80ee6dd2de6f5d|3c547c6f-979d-2d38-6742-4498998d9956","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"65c0ff603d80ee6dd2de6f5d|3c547c6f-979d-2d38-6742-4498998d9956","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715952841215},"e-683":{"id":"e-683","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-682"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"65c0ff603d80ee6dd2de6f5d|3c547c6f-979d-2d38-6742-4498998d9956","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"65c0ff603d80ee6dd2de6f5d|3c547c6f-979d-2d38-6742-4498998d9956","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":0,"direction":null,"effectIn":true},"createdOn":1715952841215},"e-690":{"id":"e-690","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-691"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"65c0ff603d80ee6dd2de6f5d|3c547c6f-979d-2d38-6742-4498998d995f","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"65c0ff603d80ee6dd2de6f5d|3c547c6f-979d-2d38-6742-4498998d995f","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715952841215},"e-691":{"id":"e-691","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-690"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"65c0ff603d80ee6dd2de6f5d|3c547c6f-979d-2d38-6742-4498998d995f","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"65c0ff603d80ee6dd2de6f5d|3c547c6f-979d-2d38-6742-4498998d995f","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715952841215},"e-696":{"id":"e-696","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-697"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"65c0ff603d80ee6dd2de6f5d|3c547c6f-979d-2d38-6742-4498998d9968","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"65c0ff603d80ee6dd2de6f5d|3c547c6f-979d-2d38-6742-4498998d9968","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715952841215},"e-697":{"id":"e-697","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-696"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"65c0ff603d80ee6dd2de6f5d|3c547c6f-979d-2d38-6742-4498998d9968","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"65c0ff603d80ee6dd2de6f5d|3c547c6f-979d-2d38-6742-4498998d9968","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715952841215},"e-700":{"id":"e-700","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-701"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"64f06d4a31cd707991282add|dfe8b126-1975-e53c-9065-66c387b075d7","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"64f06d4a31cd707991282add|dfe8b126-1975-e53c-9065-66c387b075d7","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1716461916300},"e-701":{"id":"e-701","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-700"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"64f06d4a31cd707991282add|dfe8b126-1975-e53c-9065-66c387b075d7","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"64f06d4a31cd707991282add|dfe8b126-1975-e53c-9065-66c387b075d7","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":0,"direction":null,"effectIn":true},"createdOn":1716461916300},"e-704":{"id":"e-704","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-705"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"64f06d4a31cd707991282add|dfe8b126-1975-e53c-9065-66c387b075e0","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"64f06d4a31cd707991282add|dfe8b126-1975-e53c-9065-66c387b075e0","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1716461916300},"e-705":{"id":"e-705","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-704"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"64f06d4a31cd707991282add|dfe8b126-1975-e53c-9065-66c387b075e0","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"64f06d4a31cd707991282add|dfe8b126-1975-e53c-9065-66c387b075e0","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1716461916300},"e-710":{"id":"e-710","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-711"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"64f06d4a31cd707991282add|dfe8b126-1975-e53c-9065-66c387b075e9","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"64f06d4a31cd707991282add|dfe8b126-1975-e53c-9065-66c387b075e9","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1716461916300},"e-711":{"id":"e-711","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-710"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"64f06d4a31cd707991282add|dfe8b126-1975-e53c-9065-66c387b075e9","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"64f06d4a31cd707991282add|dfe8b126-1975-e53c-9065-66c387b075e9","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1716461916300},"e-712":{"id":"e-712","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-713"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"64f06d4a31cd707991282add|dfe8b126-1975-e53c-9065-66c387b075fe","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"64f06d4a31cd707991282add|dfe8b126-1975-e53c-9065-66c387b075fe","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1716461916300},"e-713":{"id":"e-713","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-712"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"64f06d4a31cd707991282add|dfe8b126-1975-e53c-9065-66c387b075fe","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"64f06d4a31cd707991282add|dfe8b126-1975-e53c-9065-66c387b075fe","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":0,"direction":null,"effectIn":true},"createdOn":1716461916300},"e-720":{"id":"e-720","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-721"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"64f06d4a31cd707991282add|dfe8b126-1975-e53c-9065-66c387b07607","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"64f06d4a31cd707991282add|dfe8b126-1975-e53c-9065-66c387b07607","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1716461916300},"e-721":{"id":"e-721","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-720"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"64f06d4a31cd707991282add|dfe8b126-1975-e53c-9065-66c387b07607","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"64f06d4a31cd707991282add|dfe8b126-1975-e53c-9065-66c387b07607","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1716461916300},"e-724":{"id":"e-724","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-725"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"64f06d4a31cd707991282add|dfe8b126-1975-e53c-9065-66c387b07610","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"64f06d4a31cd707991282add|dfe8b126-1975-e53c-9065-66c387b07610","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1716461916300},"e-725":{"id":"e-725","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-724"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"64f06d4a31cd707991282add|dfe8b126-1975-e53c-9065-66c387b07610","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"64f06d4a31cd707991282add|dfe8b126-1975-e53c-9065-66c387b07610","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1716461916300},"e-737":{"id":"e-737","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-738"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"66aa04c76c518168a13b0a61|dfe8b126-1975-e53c-9065-66c387b075d7","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"66aa04c76c518168a13b0a61|dfe8b126-1975-e53c-9065-66c387b075d7","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1722418375261},"e-738":{"id":"e-738","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-737"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"66aa04c76c518168a13b0a61|dfe8b126-1975-e53c-9065-66c387b075d7","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"66aa04c76c518168a13b0a61|dfe8b126-1975-e53c-9065-66c387b075d7","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":0,"direction":null,"effectIn":true},"createdOn":1722418375261},"e-741":{"id":"e-741","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-742"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"66aa04c76c518168a13b0a61|dfe8b126-1975-e53c-9065-66c387b075e0","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"66aa04c76c518168a13b0a61|dfe8b126-1975-e53c-9065-66c387b075e0","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1722418375261},"e-742":{"id":"e-742","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-741"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"66aa04c76c518168a13b0a61|dfe8b126-1975-e53c-9065-66c387b075e0","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"66aa04c76c518168a13b0a61|dfe8b126-1975-e53c-9065-66c387b075e0","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1722418375261},"e-747":{"id":"e-747","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-748"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"66aa04c76c518168a13b0a61|dfe8b126-1975-e53c-9065-66c387b075e9","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"66aa04c76c518168a13b0a61|dfe8b126-1975-e53c-9065-66c387b075e9","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1722418375261},"e-748":{"id":"e-748","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-747"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"66aa04c76c518168a13b0a61|dfe8b126-1975-e53c-9065-66c387b075e9","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"66aa04c76c518168a13b0a61|dfe8b126-1975-e53c-9065-66c387b075e9","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1722418375261},"e-749":{"id":"e-749","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-750"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"66aa04c76c518168a13b0a61|dfe8b126-1975-e53c-9065-66c387b075fe","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"66aa04c76c518168a13b0a61|dfe8b126-1975-e53c-9065-66c387b075fe","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1722418375261},"e-750":{"id":"e-750","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-749"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"66aa04c76c518168a13b0a61|dfe8b126-1975-e53c-9065-66c387b075fe","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"66aa04c76c518168a13b0a61|dfe8b126-1975-e53c-9065-66c387b075fe","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":0,"direction":null,"effectIn":true},"createdOn":1722418375261},"e-757":{"id":"e-757","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-758"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"66aa04c76c518168a13b0a61|dfe8b126-1975-e53c-9065-66c387b07607","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"66aa04c76c518168a13b0a61|dfe8b126-1975-e53c-9065-66c387b07607","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1722418375261},"e-758":{"id":"e-758","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-757"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"66aa04c76c518168a13b0a61|dfe8b126-1975-e53c-9065-66c387b07607","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"66aa04c76c518168a13b0a61|dfe8b126-1975-e53c-9065-66c387b07607","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1722418375261},"e-761":{"id":"e-761","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-762"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"66aa04c76c518168a13b0a61|dfe8b126-1975-e53c-9065-66c387b07610","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"66aa04c76c518168a13b0a61|dfe8b126-1975-e53c-9065-66c387b07610","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1722418375261},"e-762":{"id":"e-762","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-761"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"66aa04c76c518168a13b0a61|dfe8b126-1975-e53c-9065-66c387b07610","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"66aa04c76c518168a13b0a61|dfe8b126-1975-e53c-9065-66c387b07610","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1722418375261},"e-767":{"id":"e-767","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-90","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-768"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"66aa04c76c518168a13b0a61|91f964d1-eaa2-e8a2-b13f-6317d0640318","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"66aa04c76c518168a13b0a61|91f964d1-eaa2-e8a2-b13f-6317d0640318","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1722418394111},"e-768":{"id":"e-768","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-91","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-767"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"66aa04c76c518168a13b0a61|91f964d1-eaa2-e8a2-b13f-6317d0640318","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"66aa04c76c518168a13b0a61|91f964d1-eaa2-e8a2-b13f-6317d0640318","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1722418394111},"e-769":{"id":"e-769","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-90","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-770"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"66aa04c76c518168a13b0a61|91f964d1-eaa2-e8a2-b13f-6317d0640342","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"66aa04c76c518168a13b0a61|91f964d1-eaa2-e8a2-b13f-6317d0640342","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1722418394111},"e-770":{"id":"e-770","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-91","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-769"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"66aa04c76c518168a13b0a61|91f964d1-eaa2-e8a2-b13f-6317d0640342","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"66aa04c76c518168a13b0a61|91f964d1-eaa2-e8a2-b13f-6317d0640342","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1722418394111},"e-771":{"id":"e-771","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-90","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-772"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"66aa04c76c518168a13b0a61|91f964d1-eaa2-e8a2-b13f-6317d064032c","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"66aa04c76c518168a13b0a61|91f964d1-eaa2-e8a2-b13f-6317d064032c","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1722418394111},"e-772":{"id":"e-772","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-91","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-771"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"66aa04c76c518168a13b0a61|91f964d1-eaa2-e8a2-b13f-6317d064032c","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"66aa04c76c518168a13b0a61|91f964d1-eaa2-e8a2-b13f-6317d064032c","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1722418394111},"e-773":{"id":"e-773","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-90","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-774"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"66aa04c76c518168a13b0a61|91f964d1-eaa2-e8a2-b13f-6317d0640323","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"66aa04c76c518168a13b0a61|91f964d1-eaa2-e8a2-b13f-6317d0640323","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1722418394111},"e-774":{"id":"e-774","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-91","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-773"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"66aa04c76c518168a13b0a61|91f964d1-eaa2-e8a2-b13f-6317d0640323","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"66aa04c76c518168a13b0a61|91f964d1-eaa2-e8a2-b13f-6317d0640323","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1722418394111},"e-775":{"id":"e-775","name":"","animationType":"preset","eventTypeId":"DROPDOWN_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-90","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-776"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"66aa04c76c518168a13b0a61|91f964d1-eaa2-e8a2-b13f-6317d0640337","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"66aa04c76c518168a13b0a61|91f964d1-eaa2-e8a2-b13f-6317d0640337","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1722418394111},"e-776":{"id":"e-776","name":"","animationType":"preset","eventTypeId":"DROPDOWN_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-91","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-775"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"66aa04c76c518168a13b0a61|91f964d1-eaa2-e8a2-b13f-6317d0640337","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"66aa04c76c518168a13b0a61|91f964d1-eaa2-e8a2-b13f-6317d0640337","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1722418394111}},"actionLists":{"a-52":{"id":"a-52","title":"accordeon open","actionItemGroups":[{"actionItems":[{"id":"a-52-n","actionTypeId":"STYLE_SIZE","config":{"delay":0,"easing":"","duration":500,"target":{"useEventTarget":true,"id":"bd0631ee-32f9-2804-f324-08690f7c3590"},"heightValue":60,"widthUnit":"PX","heightUnit":"px","locked":false}},{"id":"a-52-n-2","actionTypeId":"TRANSFORM_ROTATE","config":{"delay":0,"easing":"","duration":500,"target":{"useEventTarget":"CHILDREN","selector":".icon-6","selectorGuids":["984290d3-8c44-082c-7acf-c8a5a177106a"]},"zValue":0,"xUnit":"DEG","yUnit":"DEG","zUnit":"deg"}}]},{"actionItems":[{"id":"a-52-n-3","actionTypeId":"STYLE_SIZE","config":{"delay":0,"easing":"","duration":500,"target":{"useEventTarget":true,"id":"bd0631ee-32f9-2804-f324-08690f7c3590"},"widthUnit":"PX","heightUnit":"AUTO","locked":false}},{"id":"a-52-n-4","actionTypeId":"TRANSFORM_ROTATE","config":{"delay":0,"easing":"","duration":500,"target":{"useEventTarget":"CHILDREN","selector":".icon-6","selectorGuids":["984290d3-8c44-082c-7acf-c8a5a177106a"]},"zValue":180,"xUnit":"DEG","yUnit":"DEG","zUnit":"deg"}}]}],"useFirstGroupAsInitialState":true,"createdOn":1698241859126},"a-53":{"id":"a-53","title":"accordeon close","actionItemGroups":[{"actionItems":[{"id":"a-53-n","actionTypeId":"STYLE_SIZE","config":{"delay":0,"easing":"","duration":500,"target":{"useEventTarget":true,"id":"bd0631ee-32f9-2804-f324-08690f7c3590"},"heightValue":60,"widthUnit":"PX","heightUnit":"px","locked":false}},{"id":"a-53-n-2","actionTypeId":"TRANSFORM_ROTATE","config":{"delay":0,"easing":"","duration":500,"target":{"useEventTarget":"CHILDREN","selector":".icon-6","selectorGuids":["984290d3-8c44-082c-7acf-c8a5a177106a"]},"zValue":0,"xUnit":"DEG","yUnit":"DEG","zUnit":"deg"}}]}],"useFirstGroupAsInitialState":false,"createdOn":1698242174804},"a-69":{"id":"a-69","title":"Tab in view 2","actionItemGroups":[{"actionItems":[{"id":"a-69-n","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{"useEventTarget":"CHILDREN","selector":".text-block-46","selectorGuids":["5a530494-ae5d-000e-16bf-3439c8092b0e"]},"value":"block"}}]}],"useFirstGroupAsInitialState":false,"createdOn":1698243351131},"a-70":{"id":"a-70","title":"Tab not active animation 2","actionItemGroups":[{"actionItems":[{"id":"a-70-n","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{"useEventTarget":"CHILDREN","selector":".text-block-46","selectorGuids":["5a530494-ae5d-000e-16bf-3439c8092b0e"]},"value":"block"}}]},{"actionItems":[{"id":"a-70-n-2","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{"useEventTarget":"CHILDREN","selector":".text-block-46","selectorGuids":["5a530494-ae5d-000e-16bf-3439c8092b0e"]},"value":"none"}}]}],"useFirstGroupAsInitialState":false,"createdOn":1698243233294},"a-77":{"id":"a-77","title":"Tab in view 3","actionItemGroups":[{"actionItems":[{"id":"a-77-n","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{},"value":"block"}}]}],"useFirstGroupAsInitialState":false,"createdOn":1698243351131},"a-78":{"id":"a-78","title":"Tab not active animation 3","actionItemGroups":[{"actionItems":[{"id":"a-78-n","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{},"value":"block"}}]},{"actionItems":[{"id":"a-78-n-2","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{},"value":"none"}}]}],"useFirstGroupAsInitialState":false,"createdOn":1698243233294},"a-79":{"id":"a-79","title":"Tab in view 4","actionItemGroups":[{"actionItems":[{"id":"a-79-n","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{"useEventTarget":"CHILDREN","selector":".text-block-46","selectorGuids":["5a530494-ae5d-000e-16bf-3439c8092b0e"]},"value":"block"}}]}],"useFirstGroupAsInitialState":false,"createdOn":1698243351131},"a-80":{"id":"a-80","title":"Tab not active animation 4","actionItemGroups":[{"actionItems":[{"id":"a-80-n","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{"useEventTarget":"CHILDREN","selector":".text-block-46","selectorGuids":["5a530494-ae5d-000e-16bf-3439c8092b0e"]},"value":"block"}}]},{"actionItems":[{"id":"a-80-n-2","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{"useEventTarget":"CHILDREN","selector":".text-block-46","selectorGuids":["5a530494-ae5d-000e-16bf-3439c8092b0e"]},"value":"none"}}]}],"useFirstGroupAsInitialState":false,"createdOn":1698243233294},"a-81":{"id":"a-81","title":"accordeon open 2","actionItemGroups":[{"actionItems":[{"id":"a-81-n","actionTypeId":"STYLE_SIZE","config":{"delay":0,"easing":"","duration":500,"target":{"useEventTarget":true,"id":"663b409f20c7f17958584e52|bd0631ee-32f9-2804-f324-08690f7c3590"},"heightValue":60,"widthUnit":"PX","heightUnit":"px","locked":false}},{"id":"a-81-n-2","actionTypeId":"TRANSFORM_ROTATE","config":{"delay":0,"easing":"","duration":500,"target":{"useEventTarget":"CHILDREN","selector":".icon-6","selectorGuids":["984290d3-8c44-082c-7acf-c8a5a177106a"]},"zValue":0,"xUnit":"DEG","yUnit":"DEG","zUnit":"deg"}}]},{"actionItems":[{"id":"a-81-n-3","actionTypeId":"STYLE_SIZE","config":{"delay":0,"easing":"","duration":500,"target":{"useEventTarget":true,"id":"663b409f20c7f17958584e52|bd0631ee-32f9-2804-f324-08690f7c3590"},"widthUnit":"PX","heightUnit":"AUTO","locked":false}},{"id":"a-81-n-4","actionTypeId":"TRANSFORM_ROTATE","config":{"delay":0,"easing":"","duration":500,"target":{"useEventTarget":"CHILDREN","selector":".icon-6","selectorGuids":["984290d3-8c44-082c-7acf-c8a5a177106a"]},"zValue":180,"xUnit":"DEG","yUnit":"DEG","zUnit":"deg"}}]}],"useFirstGroupAsInitialState":true,"createdOn":1698241859126},"a-82":{"id":"a-82","title":"accordeon close 2","actionItemGroups":[{"actionItems":[{"id":"a-82-n","actionTypeId":"STYLE_SIZE","config":{"delay":0,"easing":"","duration":500,"target":{"useEventTarget":true,"id":"663b409f20c7f17958584e52|bd0631ee-32f9-2804-f324-08690f7c3590"},"heightValue":60,"widthUnit":"PX","heightUnit":"px","locked":false}},{"id":"a-82-n-2","actionTypeId":"TRANSFORM_ROTATE","config":{"delay":0,"easing":"","duration":500,"target":{"useEventTarget":"CHILDREN","selector":".icon-6","selectorGuids":["984290d3-8c44-082c-7acf-c8a5a177106a"]},"zValue":0,"xUnit":"DEG","yUnit":"DEG","zUnit":"deg"}}]}],"useFirstGroupAsInitialState":false,"createdOn":1698242174804},"a-84":{"id":"a-84","title":"accordeon open 3","actionItemGroups":[{"actionItems":[{"id":"a-84-n","actionTypeId":"STYLE_SIZE","config":{"delay":0,"easing":"","duration":500,"target":{"useEventTarget":true,"id":"663b55527974ec1eba385d9c|bd0631ee-32f9-2804-f324-08690f7c3590"},"heightValue":60,"widthUnit":"PX","heightUnit":"px","locked":false}},{"id":"a-84-n-2","actionTypeId":"TRANSFORM_ROTATE","config":{"delay":0,"easing":"","duration":500,"target":{"useEventTarget":"CHILDREN","selector":".icon-6","selectorGuids":["984290d3-8c44-082c-7acf-c8a5a177106a"]},"zValue":0,"xUnit":"DEG","yUnit":"DEG","zUnit":"deg"}}]},{"actionItems":[{"id":"a-84-n-3","actionTypeId":"STYLE_SIZE","config":{"delay":0,"easing":"","duration":500,"target":{"useEventTarget":true,"id":"663b55527974ec1eba385d9c|bd0631ee-32f9-2804-f324-08690f7c3590"},"widthUnit":"PX","heightUnit":"AUTO","locked":false}},{"id":"a-84-n-4","actionTypeId":"TRANSFORM_ROTATE","config":{"delay":0,"easing":"","duration":500,"target":{"useEventTarget":"CHILDREN","selector":".icon-6","selectorGuids":["984290d3-8c44-082c-7acf-c8a5a177106a"]},"zValue":180,"xUnit":"DEG","yUnit":"DEG","zUnit":"deg"}}]}],"useFirstGroupAsInitialState":true,"createdOn":1698241859126},"a-85":{"id":"a-85","title":"accordeon close 3","actionItemGroups":[{"actionItems":[{"id":"a-85-n","actionTypeId":"STYLE_SIZE","config":{"delay":0,"easing":"","duration":500,"target":{"useEventTarget":true,"id":"663b55527974ec1eba385d9c|bd0631ee-32f9-2804-f324-08690f7c3590"},"heightValue":60,"widthUnit":"PX","heightUnit":"px","locked":false}},{"id":"a-85-n-2","actionTypeId":"TRANSFORM_ROTATE","config":{"delay":0,"easing":"","duration":500,"target":{"useEventTarget":"CHILDREN","selector":".icon-6","selectorGuids":["984290d3-8c44-082c-7acf-c8a5a177106a"]},"zValue":0,"xUnit":"DEG","yUnit":"DEG","zUnit":"deg"}}]}],"useFirstGroupAsInitialState":false,"createdOn":1698242174804},"a-88":{"id":"a-88","title":"Tab in view 6","actionItemGroups":[{"actionItems":[{"id":"a-88-n","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{"useEventTarget":"CHILDREN","selector":".text-block-46","selectorGuids":["5a530494-ae5d-000e-16bf-3439c8092b0e"]},"value":"block"}}]}],"useFirstGroupAsInitialState":false,"createdOn":1698243351131},"a-89":{"id":"a-89","title":"Tab not active animation 6","actionItemGroups":[{"actionItems":[{"id":"a-89-n","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{"useEventTarget":"CHILDREN","selector":".text-block-46","selectorGuids":["5a530494-ae5d-000e-16bf-3439c8092b0e"]},"value":"block"}}]},{"actionItems":[{"id":"a-89-n-2","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{"useEventTarget":"CHILDREN","selector":".text-block-46","selectorGuids":["5a530494-ae5d-000e-16bf-3439c8092b0e"]},"value":"none"}}]}],"useFirstGroupAsInitialState":false,"createdOn":1698243233294},"a-90":{"id":"a-90","title":"accordeon open 4","actionItemGroups":[{"actionItems":[{"id":"a-90-n","actionTypeId":"STYLE_SIZE","config":{"delay":0,"easing":"","duration":500,"target":{"useEventTarget":true,"id":"66aa04c76c518168a13b0a61|91f964d1-eaa2-e8a2-b13f-6317d0640318"},"heightValue":60,"widthUnit":"PX","heightUnit":"px","locked":false}},{"id":"a-90-n-2","actionTypeId":"TRANSFORM_ROTATE","config":{"delay":0,"easing":"","duration":500,"target":{"useEventTarget":"CHILDREN","selector":".icon-6","selectorGuids":["984290d3-8c44-082c-7acf-c8a5a177106a"]},"zValue":0,"xUnit":"DEG","yUnit":"DEG","zUnit":"deg"}}]},{"actionItems":[{"id":"a-90-n-3","actionTypeId":"STYLE_SIZE","config":{"delay":0,"easing":"","duration":500,"target":{"useEventTarget":true,"id":"66aa04c76c518168a13b0a61|91f964d1-eaa2-e8a2-b13f-6317d0640318"},"widthUnit":"PX","heightUnit":"AUTO","locked":false}},{"id":"a-90-n-4","actionTypeId":"TRANSFORM_ROTATE","config":{"delay":0,"easing":"","duration":500,"target":{"useEventTarget":"CHILDREN","selector":".icon-6","selectorGuids":["984290d3-8c44-082c-7acf-c8a5a177106a"]},"zValue":180,"xUnit":"DEG","yUnit":"DEG","zUnit":"deg"}}]}],"useFirstGroupAsInitialState":true,"createdOn":1698241859126},"a-91":{"id":"a-91","title":"accordeon close 4","actionItemGroups":[{"actionItems":[{"id":"a-91-n","actionTypeId":"STYLE_SIZE","config":{"delay":0,"easing":"","duration":500,"target":{"useEventTarget":true,"id":"66aa04c76c518168a13b0a61|91f964d1-eaa2-e8a2-b13f-6317d0640318"},"heightValue":60,"widthUnit":"PX","heightUnit":"px","locked":false}},{"id":"a-91-n-2","actionTypeId":"TRANSFORM_ROTATE","config":{"delay":0,"easing":"","duration":500,"target":{"useEventTarget":"CHILDREN","selector":".icon-6","selectorGuids":["984290d3-8c44-082c-7acf-c8a5a177106a"]},"zValue":0,"xUnit":"DEG","yUnit":"DEG","zUnit":"deg"}}]}],"useFirstGroupAsInitialState":false,"createdOn":1698242174804}},"site":{"mediaQueries":[{"key":"main","min":992,"max":10000},{"key":"medium","min":768,"max":991},{"key":"small","min":480,"max":767},{"key":"tiny","min":0,"max":479}]}}'
);

export function EnChPotsdamLandingpage({ as: _Component = _Builtin.Block }) {
  _interactions.useInteractions(_interactionsData, _styles);

  return (
    <_Component className={_utils.cx(_styles, "ch-potsdam-landingpage")} tag="div">
      <_Builtin.Section
        className={_utils.cx(_styles, "section-header-ch-desktop")}
        grid={{
          type: "section",
        }}
        tag="section"
      >
        <_Builtin.BlockContainer
          className={_utils.cx(_styles, "container-67")}
          grid={{
            type: "container",
          }}
          tag="div"
        >
          <_Builtin.Image
            className={_utils.cx(_styles, "line-1")}
            loading="lazy"
            width="auto"
            height="auto"
            alt=""
            src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/659680ce18c9fd0e673be88a_Line%201.svg"
          />
          <_Builtin.Block className={_utils.cx(_styles, "div-block-190")} tag="div">
            <_Builtin.SliderWrapper
              className={_utils.cx(_styles, "slider-9")}
              navSpacing={3}
              navShadow={false}
              autoplay={true}
              delay={4000}
              iconArrows={true}
              animation="slide"
              navNumbers={true}
              easing="ease"
              navRound={true}
              hideArrows={false}
              disableSwipe={false}
              duration={500}
              infinite={true}
              autoMax={0}
              navInvert={false}
            >
              <_Builtin.SliderMask className={_utils.cx(_styles, "mask-5")}>
                <_Builtin.SliderSlide tag="div">
                  <_Builtin.Block
                    className={_utils.cx(_styles, "div-block-180", "pic1")}
                    tag="div"
                  />
                </_Builtin.SliderSlide>
                <_Builtin.SliderSlide tag="div">
                  <_Builtin.Block
                    className={_utils.cx(_styles, "div-block-180", "pic2")}
                    tag="div"
                  />
                </_Builtin.SliderSlide>
                <_Builtin.SliderSlide tag="div">
                  <_Builtin.Block
                    className={_utils.cx(_styles, "div-block-180", "pic-3")}
                    tag="div"
                  />
                </_Builtin.SliderSlide>
              </_Builtin.SliderMask>
              <_Builtin.SliderArrow className={_utils.cx(_styles, "left-arrow-6")} dir="left">
                <_Builtin.Icon
                  widget={{
                    type: "icon",
                    icon: "slider-left",
                  }}
                />
              </_Builtin.SliderArrow>
              <_Builtin.SliderArrow className={_utils.cx(_styles, "right-arrow-6")} dir="right">
                <_Builtin.Icon
                  widget={{
                    type: "icon",
                    icon: "slider-right",
                  }}
                />
              </_Builtin.SliderArrow>
              <_Builtin.SliderNav className={_utils.cx(_styles, "slide-nav-5")} />
            </_Builtin.SliderWrapper>
          </_Builtin.Block>
          <_Builtin.Block className={_utils.cx(_styles, "div-block-195")} tag="div">
            <_Builtin.Heading className={_utils.cx(_styles, "heading-117-copy")} tag="h1">
              <_Builtin.Span className={_utils.cx(_styles, "text-span-22-copy")}>
                {"Act together "}
              </_Builtin.Span>
              {"for Potsdam"}
            </_Builtin.Heading>
            <_Builtin.Block className={_utils.cx(_styles, "text-block-31-copy")} tag="div">
              {
                "The ClimateHub shows you the big levers in climate protection. Find projects and groups from Potsdam to get involved yourself and increase your handprint."
              }
            </_Builtin.Block>
            <_Builtin.Block
              className={_utils.cj(_utils.cx(_styles, "div-block-168"), "w-clearfix")}
              tag="div"
            >
              <_Builtin.Link
                className={_utils.cx(_styles, "button-gradient")}
                button={true}
                block=""
                options={{
                  href: "https://climateconnect.earth/en/hubs/potsdam",
                }}
              >
                {"Visit the ClimateHub"}
              </_Builtin.Link>
              <_Builtin.Block className={_utils.cx(_styles, "div-block-169")} tag="div">
                <_Builtin.Image
                  className={_utils.cx(_styles, "image-125")}
                  loading="lazy"
                  width="auto"
                  height="auto"
                  alt="Icon Gruppe"
                  src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bf5f26f6e865b2f5ebeea_Pfad%2010815.svg"
                />
                <_Builtin.Block className={_utils.cx(_styles, "number-users", "tips")} tag="div">
                  {"206"}
                </_Builtin.Block>
              </_Builtin.Block>
              <_Builtin.Block className={_utils.cx(_styles, "text-block")} tag="div">
                {"& DU?"}
              </_Builtin.Block>
            </_Builtin.Block>
          </_Builtin.Block>
        </_Builtin.BlockContainer>
        <_Builtin.Link
          className={_utils.cx(_styles, "div-block-118-copy")}
          button={false}
          block="inline"
          options={{
            href: "#Handprint1",
          }}
        >
          <_Builtin.Block className={_utils.cx(_styles, "text-block-19-copy")} tag="div">
            {"More about the ClimateHub"}
          </_Builtin.Block>
          <_Builtin.Image
            loading="lazy"
            width="39"
            height="auto"
            alt="Pfeil nach unten"
            src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/653919892456c0cc8a05cc5d_Pfad%2013399.svg"
          />
        </_Builtin.Link>
      </_Builtin.Section>
      <_Builtin.Section
        className={_utils.cx(_styles, "section-top-ch-landing")}
        grid={{
          type: "section",
        }}
        tag="section"
      >
        <_Builtin.Image
          className={_utils.cx(_styles, "image-116")}
          loading="lazy"
          width="auto"
          height="auto"
          alt="Klimastreik in Erlangen (Hintrergundbild)"
          src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/6502d785169e8a23fadb36f1_Klimastreik%209%2022%20cut%20editied%20(Mittel).png"
        />
        <_Builtin.BlockContainer
          className={_utils.cx(_styles, "container-62")}
          grid={{
            type: "container",
          }}
          tag="div"
        >
          <_Builtin.Block className={_utils.cx(_styles, "div-block-153")} tag="div">
            <_Builtin.Heading className={_utils.cx(_styles, "heading-117")} tag="h1">
              <_Builtin.Span className={_utils.cx(_styles, "text-span-22-copy")}>
                {"Gemeinsam "}
              </_Builtin.Span>
              {"für Potsdam Anpacken"}
            </_Builtin.Heading>
            <_Builtin.Block className={_utils.cx(_styles, "text-block-31")} tag="div">
              {
                "Der ClimateHub zeigt dir die großen Hebel im Klimaschutz. Finde Potsdamer Projekte und Gruppen um selber an zu packen und deinen Handabdruck zu vergrößern."
              }
            </_Builtin.Block>
            <_Builtin.Block
              className={_utils.cj(_utils.cx(_styles, "div-block-168"), "w-clearfix")}
              tag="div"
            >
              <_Builtin.Link
                className={_utils.cx(_styles, "button-in-main-color-copy")}
                button={true}
                block=""
                options={{
                  href: "https://climateconnect.earth/de/hubs/erlangen",
                }}
              >
                {"zum ClimateHub"}
              </_Builtin.Link>
              <_Builtin.Block className={_utils.cx(_styles, "div-block-169")} tag="div">
                <_Builtin.Image
                  className={_utils.cx(_styles, "image-125")}
                  loading="lazy"
                  width="auto"
                  height="auto"
                  alt="Icon Gruppe"
                  src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bf5f26f6e865b2f5ebeea_Pfad%2010815.svg"
                />
                <_Builtin.Block className={_utils.cx(_styles, "number-users", "tips")} tag="div">
                  {"206"}
                </_Builtin.Block>
              </_Builtin.Block>
              <_Builtin.Block className={_utils.cx(_styles, "text-block")} tag="div">
                {"& DU?"}
              </_Builtin.Block>
            </_Builtin.Block>
          </_Builtin.Block>
        </_Builtin.BlockContainer>
        <_Builtin.Image
          className={_utils.cx(_styles, "image-114")}
          loading="eager"
          width="460"
          height="auto"
          alt="Motiviert aussehende Frau"
          src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/6502d9823047254c2cb5e543_9594cf52-4bf8-4d7d-83d0-4d81186ce6e4.png"
        />
        <_Builtin.Block className={_utils.cx(_styles, "div-block-152-copy")} tag="div">
          <_Builtin.Image
            className={_utils.cx(_styles, "image-118")}
            loading="lazy"
            width="auto"
            height="auto"
            alt=""
            src="https://d3e54v103j8qbb.cloudfront.net/plugins/Basic/assets/placeholder.fd6bdcfeb6.svg"
          />
        </_Builtin.Block>
        <_Builtin.Link
          className={_utils.cx(_styles, "div-block-118-copy")}
          button={false}
          block="inline"
          options={{
            href: "#Handprint",
          }}
        >
          <_Builtin.Block className={_utils.cx(_styles, "text-block-19-copy")} tag="div">
            {"Mehr über den ClimateHub"}
          </_Builtin.Block>
          <_Builtin.Image
            loading="lazy"
            width="39"
            height="auto"
            alt="Pfeil nach unten"
            src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/653919892456c0cc8a05cc5d_Pfad%2013399.svg"
          />
        </_Builtin.Link>
      </_Builtin.Section>
      <_Builtin.Section
        className={_utils.cx(_styles, "section-104")}
        grid={{
          type: "section",
        }}
        tag="aside"
        id="Handprint1"
      >
        <_Builtin.BlockContainer
          className={_utils.cx(_styles, "container-66")}
          grid={{
            type: "container",
          }}
          tag="div"
        >
          <_Builtin.Image
            className={_utils.cx(_styles, "image-134")}
            loading="lazy"
            width="183"
            height="auto"
            alt=""
            src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/65941be2e6398748e3c0ce2d_Pfad%2013421.svg"
          />
          <_Builtin.Block className={_utils.cx(_styles, "div-block-182")} tag="div">
            <_Builtin.Heading className={_utils.cx(_styles, "heading-125")} tag="h2">
              {"Leave your guilty climate conscience at home!"}
            </_Builtin.Heading>
            <_Builtin.Paragraph className={_utils.cx(_styles, "paragraph-143")}>
              {
                "Are you often demotivated by the CO2 footprint? Most people feel pressurised or even helpless when calculating their footprint. But it's so easy to make a much bigger impact!"
              }
              <br />
            </_Builtin.Paragraph>
          </_Builtin.Block>
          <_Builtin.Block className={_utils.cx(_styles, "div-block-183")} tag="div">
            <_Builtin.Heading className={_utils.cx(_styles, "heading-125-copy")} tag="h2">
              {"We'll show you how..."}
            </_Builtin.Heading>
            <_Builtin.Block className={_utils.cx(_styles, "div-block-199")} tag="div" />
          </_Builtin.Block>
        </_Builtin.BlockContainer>
      </_Builtin.Section>
      <_Builtin.Section
        className={_utils.cx(_styles, "section-your-ch")}
        grid={{
          type: "section",
        }}
        tag="section"
      >
        <_Builtin.BlockContainer
          className={_utils.cx(_styles, "container-60")}
          grid={{
            type: "container",
          }}
          tag="div"
        >
          <_Builtin.Image
            className={_utils.cx(_styles, "image-135")}
            loading="lazy"
            width="auto"
            height="auto"
            alt=""
            src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/65950e6a9f9d9ac3981b0213_Pfad%2013403.svg"
          />
          <_Builtin.Heading className={_utils.cx(_styles, "heading-116-copy")} tag="h1">
            {"Your climate network in Potsdam"}
          </_Builtin.Heading>
          <_Builtin.Block className={_utils.cx(_styles, "div-block-186")} tag="div">
            <_Builtin.Block className={_utils.cx(_styles, "div-block-154-copy-2")} tag="div">
              <_Builtin.Paragraph>
                {
                  "The ClimateHub brings together all those active on climate issues in Potsdam. Whether it's projects that are just getting started, long-established organizations or events that you can just drop by. There's something for everyone. Try it out and join in!"
                }
              </_Builtin.Paragraph>
            </_Builtin.Block>
            <_Builtin.TabsWrapper
              className={_utils.cx(_styles, "tabs-2")}
              current="Mitmachen"
              easing="ease-in-out"
              fadeIn={500}
              fadeOut={500}
            >
              <_Builtin.TabsMenu className={_utils.cx(_styles, "tabs-menu-4")} tag="div">
                <_Builtin.TabsLink
                  className={_utils.cx(_styles, "tab-link-ch")}
                  data-w-id="71839a0b-710d-2111-871f-d06c7e281344"
                  data-w-tab="Mitmachen"
                  block="inline"
                >
                  <_Builtin.Block className={_utils.cx(_styles, "div-block-184")} tag="div">
                    <_Builtin.Block className={_utils.cx(_styles, "div-block-dots")} tag="div" />
                    <_Builtin.Block className={_utils.cx(_styles, "div-block-185")} tag="div">
                      <_Builtin.Block
                        className={_utils.cx(_styles, "text-block-45-without-break")}
                        tag="div"
                      >
                        {"Join in"}
                      </_Builtin.Block>
                      <_Builtin.Block className={_utils.cx(_styles, "text-block-46")} tag="div">
                        {"Get involved and enlarge your handprint"}
                      </_Builtin.Block>
                    </_Builtin.Block>
                  </_Builtin.Block>
                  <_Builtin.Block className={_utils.cx(_styles, "div-block-188")} tag="div" />
                </_Builtin.TabsLink>
                <_Builtin.TabsLink
                  className={_utils.cx(_styles, "tab-link-ch")}
                  data-w-id="71839a0b-710d-2111-871f-d06c7e28134d"
                  data-w-tab="Teilen"
                  block="inline"
                >
                  <_Builtin.Block className={_utils.cx(_styles, "div-block-184")} tag="div">
                    <_Builtin.Block className={_utils.cx(_styles, "div-block-dots")} tag="div" />
                    <_Builtin.Block className={_utils.cx(_styles, "div-block-185")} tag="div">
                      <_Builtin.Block className={_utils.cx(_styles, "text-block-45")} tag="div">
                        {"Share"}
                      </_Builtin.Block>
                      <_Builtin.Block className={_utils.cx(_styles, "text-block-46")} tag="div">
                        {"Show others what you are working on and find collaborators"}
                      </_Builtin.Block>
                    </_Builtin.Block>
                  </_Builtin.Block>
                  <_Builtin.Block className={_utils.cx(_styles, "div-block-188")} tag="div" />
                </_Builtin.TabsLink>
                <_Builtin.TabsLink
                  className={_utils.cx(_styles, "tab-link-ch")}
                  data-w-id="71839a0b-710d-2111-871f-d06c7e281356"
                  data-w-tab="Treffen"
                  block="inline"
                >
                  <_Builtin.Block className={_utils.cx(_styles, "div-block-184")} tag="div">
                    <_Builtin.Block className={_utils.cx(_styles, "div-block-dots")} tag="div" />
                    <_Builtin.Block className={_utils.cx(_styles, "div-block-185")} tag="div">
                      <_Builtin.Block className={_utils.cx(_styles, "text-block-45")} tag="div">
                        {"Meet"}
                      </_Builtin.Block>
                      <_Builtin.Block className={_utils.cx(_styles, "text-block-46")} tag="div">
                        {"Find local events with impact and more..."}
                      </_Builtin.Block>
                    </_Builtin.Block>
                  </_Builtin.Block>
                </_Builtin.TabsLink>
              </_Builtin.TabsMenu>
              <_Builtin.TabsContent className={_utils.cx(_styles, "tabs-content-3")} tag="div">
                <_Builtin.TabsPane tag="div" data-w-tab="Mitmachen">
                  <_Builtin.Image
                    className={_utils.cx(_styles, "image-132")}
                    width="auto"
                    height="auto"
                    loading="eager"
                    alt="Junge Frau sprich mit zweiter Person welche man von hinten sieht"
                    src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/659581382dac22c7dfe509b5_nmb-Klimakonferenz-2022-1017.jpg"
                  />
                </_Builtin.TabsPane>
                <_Builtin.TabsPane tag="div" data-w-tab="Teilen">
                  <_Builtin.Image
                    className={_utils.cx(_styles, "image-132")}
                    width="auto"
                    height="auto"
                    loading="lazy"
                    alt="Person tippt auf PC und hat den ClimateHub geöffnet"
                    src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/655de928163d061812bcd062_nmb-ClimateConnect230707-0003%20(Klein).jpg"
                  />
                </_Builtin.TabsPane>
                <_Builtin.TabsPane tag="div" data-w-tab="Treffen">
                  <_Builtin.Image
                    className={_utils.cx(_styles, "image-132")}
                    width="auto"
                    height="auto"
                    loading="eager"
                    alt="große Gruppe sitz um einen Tisch"
                    src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/655de9504992345f2708452a__DSC4482%20(Klein).jpg"
                  />
                </_Builtin.TabsPane>
              </_Builtin.TabsContent>
            </_Builtin.TabsWrapper>
          </_Builtin.Block>
          <_Builtin.Block className={_utils.cx(_styles, "div-block-186-copy")} tag="div">
            <_Builtin.Block className={_utils.cx(_styles, "div-block-154-copy-2")} tag="div">
              <_Builtin.Paragraph className={_utils.cx(_styles, "paragraph-138-copy-2")}>
                {
                  "Im ClimateHub kommen alle Klimaaktiven in Erlangen zusammen. Ob Projekte die erst noch starten, alt eingesessene Organisationen oder Events zum einfach mal anschauen. Für jeden ist etwas dabei. Probiere es aus und sei dabei!"
                }
              </_Builtin.Paragraph>
            </_Builtin.Block>
            <_Builtin.TabsWrapper
              className={_utils.cx(_styles, "tabs-2-copy")}
              current="Mitmachen"
              easing="ease-in-out"
              fadeIn={500}
              fadeOut={500}
            >
              <_Builtin.TabsMenu className={_utils.cx(_styles, "tabs-menu-4-copy")} tag="div">
                <_Builtin.TabsLink
                  className={_utils.cx(_styles, "tab-link-ch")}
                  data-w-id="71839a0b-710d-2111-871f-d06c7e28136b"
                  data-w-tab="Mitmachen"
                  block="inline"
                >
                  <_Builtin.Block className={_utils.cx(_styles, "div-block-184")} tag="div">
                    <_Builtin.Block className={_utils.cx(_styles, "div-block-dots")} tag="div" />
                    <_Builtin.Block className={_utils.cx(_styles, "div-block-185")} tag="div">
                      <_Builtin.Block className={_utils.cx(_styles, "text-block-45")} tag="div">
                        {"Mitmachen"}
                      </_Builtin.Block>
                      <_Builtin.Block
                        className={_utils.cx(_styles, "text-block-46-copy")}
                        tag="div"
                      >
                        {"Bring dich ein und vergrößere deinen Handabdruck"}
                      </_Builtin.Block>
                    </_Builtin.Block>
                  </_Builtin.Block>
                  <_Builtin.Block className={_utils.cx(_styles, "div-block-188")} tag="div" />
                </_Builtin.TabsLink>
                <_Builtin.TabsLink
                  className={_utils.cx(_styles, "tab-link-ch")}
                  data-w-id="71839a0b-710d-2111-871f-d06c7e281374"
                  data-w-tab="Teilen"
                  block="inline"
                >
                  <_Builtin.Block className={_utils.cx(_styles, "div-block-184")} tag="div">
                    <_Builtin.Block className={_utils.cx(_styles, "div-block-dots")} tag="div" />
                    <_Builtin.Block className={_utils.cx(_styles, "div-block-185")} tag="div">
                      <_Builtin.Block className={_utils.cx(_styles, "text-block-45")} tag="div">
                        {"Teilen"}
                      </_Builtin.Block>
                      <_Builtin.Block
                        className={_utils.cx(_styles, "text-block-46-copy")}
                        tag="div"
                      >
                        {"Zeig anderen woran du arbeitest und finde Mitstreiter"}
                      </_Builtin.Block>
                    </_Builtin.Block>
                  </_Builtin.Block>
                  <_Builtin.Block className={_utils.cx(_styles, "div-block-188")} tag="div" />
                </_Builtin.TabsLink>
                <_Builtin.TabsLink
                  className={_utils.cx(_styles, "tab-link-ch")}
                  data-w-id="71839a0b-710d-2111-871f-d06c7e28137d"
                  data-w-tab="Treffen"
                  block="inline"
                >
                  <_Builtin.Block className={_utils.cx(_styles, "div-block-184")} tag="div">
                    <_Builtin.Block className={_utils.cx(_styles, "div-block-dots")} tag="div" />
                    <_Builtin.Block className={_utils.cx(_styles, "div-block-185")} tag="div">
                      <_Builtin.Block className={_utils.cx(_styles, "text-block-45")} tag="div">
                        {"Treffen"}
                      </_Builtin.Block>
                      <_Builtin.Block
                        className={_utils.cx(_styles, "text-block-46-copy")}
                        tag="div"
                      >
                        {"Finde lokale Events mit Impact und mehr...."}
                      </_Builtin.Block>
                    </_Builtin.Block>
                  </_Builtin.Block>
                </_Builtin.TabsLink>
              </_Builtin.TabsMenu>
              <_Builtin.TabsContent className={_utils.cx(_styles, "tabs-content-3-copy")} tag="div">
                <_Builtin.TabsPane tag="div" data-w-tab="Mitmachen">
                  <_Builtin.Image
                    className={_utils.cx(_styles, "image-132")}
                    width="auto"
                    height="auto"
                    loading="eager"
                    alt="Junge Frau sprich mit zweiter Person welche man von hinten sieht"
                    src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/659581382dac22c7dfe509b5_nmb-Klimakonferenz-2022-1017.jpg"
                  />
                </_Builtin.TabsPane>
                <_Builtin.TabsPane tag="div" data-w-tab="Teilen">
                  <_Builtin.Image
                    className={_utils.cx(_styles, "image-132")}
                    width="auto"
                    height="auto"
                    loading="lazy"
                    alt="Person tippt auf PC und hat den ClimateHub geöffnet"
                    src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/655de928163d061812bcd062_nmb-ClimateConnect230707-0003%20(Klein).jpg"
                  />
                </_Builtin.TabsPane>
                <_Builtin.TabsPane tag="div" data-w-tab="Treffen">
                  <_Builtin.Image
                    className={_utils.cx(_styles, "image-132")}
                    width="auto"
                    height="auto"
                    loading="eager"
                    alt="große Gruppe sitz um einen Tisch"
                    src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/655de9504992345f2708452a__DSC4482%20(Klein).jpg"
                  />
                </_Builtin.TabsPane>
              </_Builtin.TabsContent>
            </_Builtin.TabsWrapper>
          </_Builtin.Block>
          <_Builtin.Image
            className={_utils.cx(_styles, "line-3")}
            loading="lazy"
            width="auto"
            height="auto"
            alt=""
            src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/6597fb8985e69fb7ae100543_Gruppe%208363.svg"
          />
        </_Builtin.BlockContainer>
      </_Builtin.Section>
      <_Builtin.Section
        className={_utils.cx(_styles, "section-101")}
        grid={{
          type: "section",
        }}
        tag="section"
        id="Handprint"
      >
        <_Builtin.BlockContainer
          className={_utils.cx(_styles, "container-59")}
          grid={{
            type: "container",
          }}
          tag="div"
        >
          <_Builtin.Block className={_utils.cx(_styles, "div-block-154")} tag="div">
            <_Builtin.Heading className={_utils.cx(_styles, "heading-116")} tag="h1">
              {"Deinen Handabdruck vergrößern!"}
            </_Builtin.Heading>
            <_Builtin.Paragraph className={_utils.cx(_styles, "paragraph-138")}>
              {
                "Bist du auch oft demotiviert vom CO2 Fußabdruck? Dann bist du hier genau richtig. Wir helfen dir dabei einen positiven unterschied im Klimaschutz zu machen und so deinen Handabdruck zu vergrößern."
              }
            </_Builtin.Paragraph>
            <_Builtin.Link
              className={_utils.cx(_styles, "button-on-main-color")}
              button={true}
              block=""
              options={{
                href: "#",
              }}
            >
              {"Mehr info"}
            </_Builtin.Link>
          </_Builtin.Block>
          <_Builtin.Block className={_utils.cx(_styles, "div-block-155")} tag="div">
            <_Builtin.Block className={_utils.cx(_styles, "div-block-156")} tag="div">
              <_Builtin.Block className={_utils.cx(_styles, "text-block-32")} tag="div">
                {"Baklon-Solaranlage kaufen"}
              </_Builtin.Block>
              <_Builtin.Block className={_utils.cx(_styles, "div-block-177")} tag="div">
                <_Builtin.Image
                  loading="lazy"
                  width="auto"
                  height="auto"
                  alt="Fußabdruck 0,5% "
                  src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/65032a55f401e780a3821e0f_Gruppe%208338.svg"
                />
                <_Builtin.Block className={_utils.cx(_styles, "text-block-42")} tag="div">
                  {"x 0,5"}
                </_Builtin.Block>
              </_Builtin.Block>
            </_Builtin.Block>
            <_Builtin.Block className={_utils.cx(_styles, "div-block-156")} tag="div">
              <_Builtin.Block className={_utils.cx(_styles, "text-block-32")} tag="div">
                {"5h die Woche Solarberatungen machen"}
              </_Builtin.Block>
              <_Builtin.Image
                loading="lazy"
                width="auto"
                height="auto"
                alt="Fußabdruck 13x"
                src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/65032ac39b5ac47f421da369_Gruppe%208339.svg"
              />
            </_Builtin.Block>
          </_Builtin.Block>
        </_Builtin.BlockContainer>
      </_Builtin.Section>
      <_Builtin.Section
        className={_utils.cx(_styles, "section-ch-projects")}
        grid={{
          type: "section",
        }}
        tag="section"
      >
        <_Builtin.BlockContainer
          className={_utils.cx(_styles, "container-61")}
          grid={{
            type: "container",
          }}
          tag="div"
        >
          <_Builtin.Heading className={_utils.cx(_styles, "heading-123")} tag="h1">
            {"What we have already achieved together"}
          </_Builtin.Heading>
          <_Builtin.SliderWrapper
            className={_utils.cx(_styles, "slider-projects")}
            navSpacing={3}
            navShadow={false}
            autoplay={false}
            delay={4000}
            iconArrows={true}
            animation="slide"
            navNumbers={false}
            easing="ease"
            navRound={true}
            hideArrows={false}
            disableSwipe={false}
            duration={500}
            infinite={true}
            autoMax={0}
            navInvert={false}
          >
            <_Builtin.SliderMask className={_utils.cx(_styles, "mask-4")}>
              <_Builtin.SliderSlide tag="div">
                <_Builtin.Block className={_utils.cx(_styles, "slide-wrapper")} tag="div">
                  <_Builtin.Block
                    className={_utils.cj(
                      _utils.cx(_styles, "div-project-card-slide"),
                      "w-clearfix"
                    )}
                    tag="div"
                  >
                    <_Builtin.Image
                      className={_utils.cx(_styles, "image-120-copy")}
                      width="auto"
                      height="auto"
                      loading="lazy"
                      alt="Banner BürgerEnergieTag"
                      src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/65bb8e8eedde1cab2200b88b_%E2%9E%A1%EF%B8%8F%20(1920%20x%20720%20px).jpg"
                    />
                    <_Builtin.Heading className={_utils.cx(_styles, "heading-118")} tag="h3">
                      {"Citizens' Energy Day Potsdam"}
                    </_Builtin.Heading>
                    <_Builtin.Block className={_utils.cx(_styles, "text-block-33")} tag="div">
                      <_Builtin.Emphasized>{"Organised by the ClimateHub"}</_Builtin.Emphasized>
                    </_Builtin.Block>
                    <_Builtin.Paragraph className={_utils.cx(_styles, "paragraph-139")}>
                      {
                        "Wir gründen eine Bürgerenergie-Genossenschaft für Potsdam! Am 23.02.24 haben wir mit dem BürgerEnergieTag ein neues Kapitel in der Potsdamer Energiewende gestartet. "
                      }
                    </_Builtin.Paragraph>
                    <_Builtin.Block className={_utils.cx(_styles, "div-block-158")} tag="div">
                      <_Builtin.Block className={_utils.cx(_styles, "div-block-159")} tag="div">
                        <_Builtin.Image
                          className={_utils.cx(_styles, "image-121")}
                          width="auto"
                          height="auto"
                          loading="lazy"
                          alt="Herz icon"
                          src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bd91736364e7718c3a6e0_favorite_FILL1_wght400_GRAD0_opsz48.svg"
                        />
                        <_Builtin.Block className={_utils.cx(_styles, "text-block-34")} tag="div">
                          {"5"}
                        </_Builtin.Block>
                      </_Builtin.Block>
                      <_Builtin.Block className={_utils.cx(_styles, "div-block-159")} tag="div">
                        <_Builtin.Image
                          className={_utils.cx(_styles, "image-121")}
                          width="auto"
                          height="auto"
                          loading="lazy"
                          alt="Kommentar Icon"
                          src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bd91736364e7718c3a6e4_mode_comment_FILL0_wght400_GRAD0_opsz48.svg"
                        />
                        <_Builtin.Block className={_utils.cx(_styles, "text-block-34")} tag="div">
                          {"2"}
                        </_Builtin.Block>
                      </_Builtin.Block>
                    </_Builtin.Block>
                    <_Builtin.Link
                      className={_utils.cx(_styles, "button-in-main-color")}
                      button={true}
                      block=""
                      options={{
                        href:
                          "https://climateconnect.earth/post/the-energy-transition-is-becoming-democratic-potsdam-relies-on-citizen-energy",
                        target: "_blank",
                      }}
                    >
                      {"Learn more"}
                    </_Builtin.Link>
                  </_Builtin.Block>
                </_Builtin.Block>
              </_Builtin.SliderSlide>
              <_Builtin.SliderSlide className={_utils.cx(_styles, "slide-12")} tag="div">
                <_Builtin.Block className={_utils.cx(_styles, "slide-wrapper")} tag="div">
                  <_Builtin.Block
                    className={_utils.cj(
                      _utils.cx(_styles, "div-project-card-slide"),
                      "w-clearfix"
                    )}
                    tag="div"
                  >
                    <_Builtin.Image
                      className={_utils.cx(_styles, "image-120")}
                      width="auto"
                      height="auto"
                      loading="lazy"
                      alt="Small field for growing organic vegetables "
                      src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/655dfec49b61753f6e057eca_5a44ba3a7bffe920ac33bc7b835a740ce454a69e.jpeg"
                    />
                    <_Builtin.Heading className={_utils.cx(_styles, "heading-118")} tag="h3">
                      {"The Stadtacker: educational nursery for Potsdam"}
                    </_Builtin.Heading>
                    <_Builtin.Block className={_utils.cx(_styles, "text-block-33")} tag="div">
                      {"Made possible by the ClimateHub"}
                    </_Builtin.Block>
                    <_Builtin.Paragraph className={_utils.cx(_styles, "paragraph-139")}>
                      {
                        'The Stadtacker team is working on the realization of an inner-city vegetable garden with educational offers for young and old. The project was launched by Sina Baumgart at the 1st Climate Join-in Day in Potsdam and has already won an award in the "Together for Potsdam" funding competition.'
                      }
                    </_Builtin.Paragraph>
                    <_Builtin.Block className={_utils.cx(_styles, "div-block-158")} tag="div">
                      <_Builtin.Block className={_utils.cx(_styles, "div-block-159")} tag="div">
                        <_Builtin.Image
                          className={_utils.cx(_styles, "image-121")}
                          width="auto"
                          height="auto"
                          loading="lazy"
                          alt="Herz icon"
                          src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bd91736364e7718c3a6e0_favorite_FILL1_wght400_GRAD0_opsz48.svg"
                        />
                        <_Builtin.Block className={_utils.cx(_styles, "text-block-34")} tag="div">
                          {"5"}
                        </_Builtin.Block>
                      </_Builtin.Block>
                      <_Builtin.Block className={_utils.cx(_styles, "div-block-159")} tag="div">
                        <_Builtin.Image
                          className={_utils.cx(_styles, "image-121")}
                          width="auto"
                          height="auto"
                          loading="lazy"
                          alt="Kommentar Icon"
                          src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bd91736364e7718c3a6e4_mode_comment_FILL0_wght400_GRAD0_opsz48.svg"
                        />
                        <_Builtin.Block className={_utils.cx(_styles, "text-block-34")} tag="div">
                          {"2"}
                        </_Builtin.Block>
                      </_Builtin.Block>
                    </_Builtin.Block>
                    <_Builtin.Link
                      className={_utils.cx(_styles, "button-in-main-color")}
                      button={true}
                      block=""
                      options={{
                        href:
                          "https://climateconnect.earth/en/projects/stadtacker-eine-bildungsgartnerei-der-zukunft-fur-potsdam?hubPage=potsdam",
                      }}
                    >
                      {"Learn more"}
                    </_Builtin.Link>
                  </_Builtin.Block>
                </_Builtin.Block>
              </_Builtin.SliderSlide>
              <_Builtin.SliderSlide tag="div">
                <_Builtin.Block className={_utils.cx(_styles, "slide-wrapper")} tag="div">
                  <_Builtin.Block
                    className={_utils.cj(
                      _utils.cx(_styles, "div-project-card-slide"),
                      "w-clearfix"
                    )}
                    tag="div"
                  >
                    <_Builtin.Image
                      className={_utils.cx(_styles, "image-120")}
                      width="auto"
                      height="auto"
                      loading="lazy"
                      alt="große Gruppe sitz um einen Tisch"
                      src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/655de9504992345f2708452a__DSC4482%20(Klein).jpg"
                    />
                    <_Builtin.Heading className={_utils.cx(_styles, "heading-118")} tag="h3">
                      {"Climate Join-In Day"}
                    </_Builtin.Heading>
                    <_Builtin.Block className={_utils.cx(_styles, "text-block-33")} tag="div">
                      {"Made possible by the ClimateHub"}
                    </_Builtin.Block>
                    <_Builtin.Paragraph className={_utils.cx(_styles, "paragraph-139")}>
                      {
                        "The first Climate Join-in Day in Potsdam was a complete success with almost 100 participants. The ClimateHub was opened and several new collaborations and projects were initiated. "
                      }
                    </_Builtin.Paragraph>
                    <_Builtin.Block className={_utils.cx(_styles, "div-block-158")} tag="div">
                      <_Builtin.Block className={_utils.cx(_styles, "div-block-159")} tag="div">
                        <_Builtin.Image
                          className={_utils.cx(_styles, "image-121")}
                          width="auto"
                          height="auto"
                          loading="lazy"
                          alt="Herz icon"
                          src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bd91736364e7718c3a6e0_favorite_FILL1_wght400_GRAD0_opsz48.svg"
                        />
                        <_Builtin.Block className={_utils.cx(_styles, "text-block-34")} tag="div">
                          {"5"}
                        </_Builtin.Block>
                      </_Builtin.Block>
                      <_Builtin.Block className={_utils.cx(_styles, "div-block-159")} tag="div">
                        <_Builtin.Image
                          className={_utils.cx(_styles, "image-121")}
                          width="auto"
                          height="auto"
                          loading="lazy"
                          alt="Kommentar Icon"
                          src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bd91736364e7718c3a6e4_mode_comment_FILL0_wght400_GRAD0_opsz48.svg"
                        />
                        <_Builtin.Block className={_utils.cx(_styles, "text-block-34")} tag="div">
                          {"3"}
                        </_Builtin.Block>
                      </_Builtin.Block>
                    </_Builtin.Block>
                    <_Builtin.Link
                      className={_utils.cx(_styles, "button-in-main-color")}
                      button={true}
                      block=""
                      options={{
                        href: "https://climateconnect.earth/en/projects/klima-mitmach-tag-potsdam",
                      }}
                    >
                      {"Learn More"}
                    </_Builtin.Link>
                  </_Builtin.Block>
                </_Builtin.Block>
              </_Builtin.SliderSlide>
            </_Builtin.SliderMask>
            <_Builtin.SliderArrow dir="left">
              <_Builtin.Icon
                widget={{
                  type: "icon",
                  icon: "slider-left",
                }}
              />
            </_Builtin.SliderArrow>
            <_Builtin.SliderArrow dir="right">
              <_Builtin.Icon
                widget={{
                  type: "icon",
                  icon: "slider-right",
                }}
              />
            </_Builtin.SliderArrow>
            <_Builtin.SliderNav className={_utils.cx(_styles, "slide-nav-4")} />
          </_Builtin.SliderWrapper>
          <_Builtin.Paragraph className={_utils.cx(_styles, "paragraph-142")}>
            {
              "The ClimateHub and our climate networker Bene have already made many new projects and initiatives possible! Anyone can take part in our regular events on a wide range of topics. We actively bring functioning projects from other cities to Potsdam."
            }
          </_Builtin.Paragraph>
          <_Builtin.Block
            className={_utils.cx(_styles, "div-block-157", "div-block-176")}
            tag="div"
          >
            <_Builtin.Block
              className={_utils.cj(_utils.cx(_styles, "div-project-card"), "w-clearfix")}
              tag="div"
            >
              <_Builtin.Image
                className={_utils.cx(_styles, "image-120")}
                loading="lazy"
                width="auto"
                height="auto"
                alt="Stecker-Solaer Gruppenbild"
                src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bdeebd308f8ac4a32c201_DSC04561_edited%20(Mittel).jpg"
              />
              <_Builtin.Heading className={_utils.cx(_styles, "heading-118")} tag="h3">
                {"Stecker-Solaer: die Balkonsolarberatung in Erlangen "}
              </_Builtin.Heading>
              <_Builtin.Block className={_utils.cx(_styles, "text-block-33")} tag="div">
                {"Durch den ClimateHub möglich gemacht"}
              </_Builtin.Block>
              <_Builtin.Paragraph className={_utils.cx(_styles, "paragraph-139")}>
                {
                  "Stecker-Solaer ist eine ehrenamtliche Balkonsolarberatung die durch den ClimateHub Erlangen und unseren Klimaverentzer ermöglicht wurde. Mit inzwischen xxx Beratungen und vielen Infoständen konnten unzählige Anlagen möglich gemacht werden."
                }
              </_Builtin.Paragraph>
              <_Builtin.Block className={_utils.cx(_styles, "div-block-158")} tag="div">
                <_Builtin.Block className={_utils.cx(_styles, "div-block-159")} tag="div">
                  <_Builtin.Image
                    className={_utils.cx(_styles, "image-121")}
                    loading="lazy"
                    width="auto"
                    height="auto"
                    alt="Herz icon"
                    src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bd91736364e7718c3a6e0_favorite_FILL1_wght400_GRAD0_opsz48.svg"
                  />
                  <_Builtin.Block className={_utils.cx(_styles, "text-block-34")} tag="div">
                    {"5"}
                  </_Builtin.Block>
                </_Builtin.Block>
                <_Builtin.Block className={_utils.cx(_styles, "div-block-159")} tag="div">
                  <_Builtin.Image
                    className={_utils.cx(_styles, "image-121")}
                    loading="lazy"
                    width="auto"
                    height="auto"
                    alt="Kommentar Icon"
                    src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bd91736364e7718c3a6e4_mode_comment_FILL0_wght400_GRAD0_opsz48.svg"
                  />
                  <_Builtin.Block className={_utils.cx(_styles, "text-block-34")} tag="div">
                    {"2"}
                  </_Builtin.Block>
                </_Builtin.Block>
              </_Builtin.Block>
              <_Builtin.Link
                className={_utils.cx(_styles, "button-in-main-color")}
                button={true}
                block=""
                options={{
                  href: "#",
                }}
              >
                {"Mehr erfahren"}
              </_Builtin.Link>
            </_Builtin.Block>
            <_Builtin.Block
              className={_utils.cj(_utils.cx(_styles, "div-project-card"), "w-clearfix")}
              tag="div"
            >
              <_Builtin.Image
                className={_utils.cx(_styles, "image-120")}
                loading="lazy"
                width="auto"
                height="auto"
                alt=""
                src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bf9ba4e33d016c1da2c9c_1013944031e70ee06f7743005c3dedcc73268601.jpeg"
              />
              <_Builtin.Heading className={_utils.cx(_styles, "heading-118")} tag="h3">
                {"Klimafreundliche Großküchen in Erlangen"}
              </_Builtin.Heading>
              <_Builtin.Block className={_utils.cx(_styles, "text-block-33")} tag="div">
                {"Durch den ClimateHub möglich gemacht"}
              </_Builtin.Block>
              <_Builtin.Paragraph className={_utils.cx(_styles, "paragraph-139")}>
                {
                  "Stecker-Solaer ist eine ehrenamtliche Balkonsolarberatung die durch den ClimateHub Erlangen und unseren Klimaverentzer ermöglicht wurde. Mit inzwischen xxx Beratungen und vielen Infoständen konnten unzählige Anlagen möglich gemacht werden."
                }
              </_Builtin.Paragraph>
              <_Builtin.Block className={_utils.cx(_styles, "div-block-158")} tag="div">
                <_Builtin.Block className={_utils.cx(_styles, "div-block-159")} tag="div">
                  <_Builtin.Image
                    className={_utils.cx(_styles, "image-121")}
                    loading="lazy"
                    width="auto"
                    height="auto"
                    alt="Herz icon"
                    src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bd91736364e7718c3a6e0_favorite_FILL1_wght400_GRAD0_opsz48.svg"
                  />
                  <_Builtin.Block className={_utils.cx(_styles, "text-block-34")} tag="div">
                    {"5"}
                  </_Builtin.Block>
                </_Builtin.Block>
                <_Builtin.Block className={_utils.cx(_styles, "div-block-159")} tag="div">
                  <_Builtin.Image
                    className={_utils.cx(_styles, "image-121")}
                    loading="lazy"
                    width="auto"
                    height="auto"
                    alt="Kommentar Icon"
                    src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bd91736364e7718c3a6e4_mode_comment_FILL0_wght400_GRAD0_opsz48.svg"
                  />
                  <_Builtin.Block className={_utils.cx(_styles, "text-block-34")} tag="div">
                    {"2"}
                  </_Builtin.Block>
                </_Builtin.Block>
              </_Builtin.Block>
              <_Builtin.Link
                className={_utils.cx(_styles, "button-in-main-color")}
                button={true}
                block=""
                options={{
                  href: "#",
                }}
              >
                {"Mehr erfahren"}
              </_Builtin.Link>
            </_Builtin.Block>
            <_Builtin.Block
              className={_utils.cj(_utils.cx(_styles, "div-project-card"), "w-clearfix")}
              tag="div"
            >
              <_Builtin.Image
                className={_utils.cx(_styles, "image-120")}
                loading="lazy"
                width="auto"
                height="auto"
                alt="Stecker-Solaer Gruppenbild"
                src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bdeebd308f8ac4a32c201_DSC04561_edited%20(Mittel).jpg"
              />
              <_Builtin.Heading className={_utils.cx(_styles, "heading-118")} tag="h3">
                {"Stecker-Solaer: die Balkonsolarberatung in Erlangen "}
              </_Builtin.Heading>
              <_Builtin.Block className={_utils.cx(_styles, "text-block-33")} tag="div">
                {"Durch den ClimateHub möglich gemacht"}
              </_Builtin.Block>
              <_Builtin.Paragraph className={_utils.cx(_styles, "paragraph-139")}>
                {
                  "Stecker-Solaer ist eine ehrenamtliche Balkonsolarberatung die durch den ClimateHub Erlangen und unseren Klimaverentzer ermöglicht wurde. Mit inzwischen xxx Beratungen und vielen Infoständen konnten unzählige Anlagen möglich gemacht werden."
                }
              </_Builtin.Paragraph>
              <_Builtin.Block className={_utils.cx(_styles, "div-block-158")} tag="div">
                <_Builtin.Block className={_utils.cx(_styles, "div-block-159")} tag="div">
                  <_Builtin.Image
                    className={_utils.cx(_styles, "image-121")}
                    loading="lazy"
                    width="auto"
                    height="auto"
                    alt="Herz icon"
                    src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bd91736364e7718c3a6e0_favorite_FILL1_wght400_GRAD0_opsz48.svg"
                  />
                  <_Builtin.Block className={_utils.cx(_styles, "text-block-34")} tag="div">
                    {"5"}
                  </_Builtin.Block>
                </_Builtin.Block>
                <_Builtin.Block className={_utils.cx(_styles, "div-block-159")} tag="div">
                  <_Builtin.Image
                    className={_utils.cx(_styles, "image-121")}
                    loading="lazy"
                    width="auto"
                    height="auto"
                    alt="Kommentar Icon"
                    src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bd91736364e7718c3a6e4_mode_comment_FILL0_wght400_GRAD0_opsz48.svg"
                  />
                  <_Builtin.Block className={_utils.cx(_styles, "text-block-34")} tag="div">
                    {"2"}
                  </_Builtin.Block>
                </_Builtin.Block>
              </_Builtin.Block>
              <_Builtin.Link
                className={_utils.cx(_styles, "button-in-main-color")}
                button={true}
                block=""
                options={{
                  href: "#",
                }}
              >
                {"Mehr erfahren"}
              </_Builtin.Link>
            </_Builtin.Block>
            <_Builtin.Block
              className={_utils.cj(_utils.cx(_styles, "div-project-card"), "w-clearfix")}
              tag="div"
            >
              <_Builtin.Image
                className={_utils.cx(_styles, "image-120")}
                loading="lazy"
                width="auto"
                height="auto"
                alt="Stecker-Solaer Gruppenbild"
                src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bdeebd308f8ac4a32c201_DSC04561_edited%20(Mittel).jpg"
              />
              <_Builtin.Heading className={_utils.cx(_styles, "heading-118")} tag="h3">
                {"Stecker-Solaer: die Balkonsolarberatung in Erlangen "}
              </_Builtin.Heading>
              <_Builtin.Block className={_utils.cx(_styles, "text-block-33")} tag="div">
                {"Durch den ClimateHub möglich gemacht"}
              </_Builtin.Block>
              <_Builtin.Paragraph className={_utils.cx(_styles, "paragraph-139")}>
                {
                  "Stecker-Solaer ist eine ehrenamtliche Balkonsolarberatung die durch den ClimateHub Erlangen und unseren Klimaverentzer ermöglicht wurde. Mit inzwischen xxx Beratungen und vielen Infoständen konnten unzählige Anlagen möglich gemacht werden."
                }
              </_Builtin.Paragraph>
              <_Builtin.Block className={_utils.cx(_styles, "div-block-158")} tag="div">
                <_Builtin.Block className={_utils.cx(_styles, "div-block-159")} tag="div">
                  <_Builtin.Image
                    className={_utils.cx(_styles, "image-121")}
                    loading="lazy"
                    width="auto"
                    height="auto"
                    alt="Herz icon"
                    src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bd91736364e7718c3a6e0_favorite_FILL1_wght400_GRAD0_opsz48.svg"
                  />
                  <_Builtin.Block className={_utils.cx(_styles, "text-block-34")} tag="div">
                    {"5"}
                  </_Builtin.Block>
                </_Builtin.Block>
                <_Builtin.Block className={_utils.cx(_styles, "div-block-159")} tag="div">
                  <_Builtin.Image
                    className={_utils.cx(_styles, "image-121")}
                    loading="lazy"
                    width="auto"
                    height="auto"
                    alt="Kommentar Icon"
                    src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bd91736364e7718c3a6e4_mode_comment_FILL0_wght400_GRAD0_opsz48.svg"
                  />
                  <_Builtin.Block className={_utils.cx(_styles, "text-block-34")} tag="div">
                    {"2"}
                  </_Builtin.Block>
                </_Builtin.Block>
              </_Builtin.Block>
              <_Builtin.Link
                className={_utils.cx(_styles, "button-in-main-color")}
                button={true}
                block=""
                options={{
                  href: "#",
                }}
              >
                {"Mehr erfahren"}
              </_Builtin.Link>
            </_Builtin.Block>
          </_Builtin.Block>
          <_Builtin.Block className={_utils.cx(_styles, "div-block-160")} tag="div">
            <_Builtin.Heading className={_utils.cx(_styles, "heading-119")} tag="h1">
              {'"Become part of it too!"'}
            </_Builtin.Heading>
            <_Builtin.Link
              className={_utils.cx(_styles, "button-on-main-color-ch")}
              button={true}
              block=""
              options={{
                href: "https://climateconnect.earth/de/hubs/potsdam",
              }}
            >
              {"Visit the ClimateHub"}
            </_Builtin.Link>
          </_Builtin.Block>
          <_Builtin.Image
            className={_utils.cx(_styles, "image-136")}
            loading="lazy"
            width="auto"
            height="auto"
            alt=""
            src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/65980190f8e42d4058885029_Gruppe%208364.svg"
          />
        </_Builtin.BlockContainer>
      </_Builtin.Section>
      <_Builtin.Section
        className={_utils.cx(_styles, "section-la-ch")}
        grid={{
          type: "section",
        }}
        tag="section"
      >
        <_Builtin.BlockContainer
          grid={{
            type: "container",
          }}
          tag="div"
        >
          <_Builtin.Block className={_utils.cx(_styles, "div-block-163")} tag="div">
            <_Builtin.Block tag="div">
              <_Builtin.Heading className={_utils.cx(_styles, "heading-124")} tag="h1">
                {"Always there for you: your climate networker"}
              </_Builtin.Heading>
              <_Builtin.Paragraph>
                {
                  "Whether you want to get active, are looking for allies for your idea or have a question about climate protection in Potsdam - Sophia is the climate networker at ClimateHub Potsdam and will be happy to help you. "
                }
                <br />
                {
                  "Bene is in contact with all ClimateHub members, networks local initiatives and actively facilitates new, effective climate projects. So if you can't find what you're looking for on the ClimateHub, you can contact her at any time and she'll help you."
                }
                <br />
              </_Builtin.Paragraph>
            </_Builtin.Block>
            <_Builtin.Block className={_utils.cx(_styles, "div-block-162")} tag="div">
              <_Builtin.Image
                className={_utils.cx(_styles, "image-122")}
                loading="lazy"
                width="auto"
                height="auto"
                alt=""
                src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651be25f8c40de720be3daf2_Bene%2023%20spuare.jpg"
              />
              <_Builtin.Heading className={_utils.cx(_styles, "heading-120")} tag="h2">
                {"Bene Cziesla"}
              </_Builtin.Heading>
              <_Builtin.Block className={_utils.cx(_styles, "text-block-35")} tag="div">
                {'"Let\'s make climate protection a joint task in Erlangen!"'}
              </_Builtin.Block>
              <_Builtin.Link
                className={_utils.cx(_styles, "button-on-main-color")}
                button={true}
                block=""
                options={{
                  href: "mailto:benedikt.cziesla@climateconnect.earth",
                }}
              >
                {"write a message"}
              </_Builtin.Link>
            </_Builtin.Block>
          </_Builtin.Block>
        </_Builtin.BlockContainer>
      </_Builtin.Section>
      <_Builtin.Section
        className={_utils.cx(_styles, "section-102")}
        grid={{
          type: "section",
        }}
        tag="section"
      >
        <_Builtin.BlockContainer
          grid={{
            type: "container",
          }}
          tag="div"
        >
          <_Builtin.Block className={_utils.cx(_styles, "div-block-164")} tag="div">
            <_Builtin.Block className={_utils.cx(_styles, "div-block-165")} tag="div">
              <_Builtin.Heading tag="h1">{"How does the ClimateHub work?"}</_Builtin.Heading>
              <_Builtin.Paragraph>
                {
                  "The ClimateHub is a non-profit contact point for all people who are committed to climate protection in Potsdam and who want to get involved. We have our own online platform as a digital exchange platform and our local networker Bene on site. Together, we bring all the city's stakeholders together to fight the climate crisis. With many events and campaigns, we inspire even more people to get involved in climate protection."
                }
              </_Builtin.Paragraph>
            </_Builtin.Block>
            <_Builtin.Block className={_utils.cx(_styles, "div-block-166")} tag="div">
              <_Builtin.DropdownWrapper
                className={_utils.cx(_styles, "accordeon-ch")}
                data-w-id="71839a0b-710d-2111-871f-d06c7e28145d"
                tag="div"
                delay={0}
                hover={false}
              >
                <_Builtin.DropdownToggle
                  className={_utils.cx(_styles, "dropdown-toggle-3")}
                  tag="div"
                >
                  <_Builtin.Icon
                    className={_utils.cx(_styles, "icon-6")}
                    widget={{
                      type: "icon",
                      icon: "dropdown-toggle",
                    }}
                  />
                  <_Builtin.Block className={_utils.cx(_styles, "text-block-36")} tag="div">
                    {"Online Plattform"}
                  </_Builtin.Block>
                  <_Builtin.Block className={_utils.cx(_styles, "div-block-167")} tag="div" />
                </_Builtin.DropdownToggle>
                <_Builtin.DropdownList
                  className={_utils.cj(_utils.cx(_styles, "dropdown-list-4"), "w-clearfix")}
                  tag="nav"
                >
                  <_Builtin.Paragraph className={_utils.cx(_styles, "paragraph-140")}>
                    {
                      "The platform brings together all groups from Potsdam and makes them easy to find. It is a central exchange point for interested and active people."
                    }
                  </_Builtin.Paragraph>
                  <_Builtin.Link
                    className={_utils.cx(_styles, "button-in-main-color")}
                    button={true}
                    block=""
                    options={{
                      href: "https://climateconnect.earth/en/hubs/potsdam",
                    }}
                  >
                    {"To the Plattform"}
                  </_Builtin.Link>
                </_Builtin.DropdownList>
              </_Builtin.DropdownWrapper>
              <_Builtin.DropdownWrapper
                className={_utils.cx(_styles, "accordeon-ch")}
                data-w-id="71839a0b-710d-2111-871f-d06c7e281468"
                tag="div"
                delay={0}
                hover={false}
              >
                <_Builtin.DropdownToggle
                  className={_utils.cx(_styles, "dropdown-toggle-3")}
                  tag="div"
                >
                  <_Builtin.Icon
                    className={_utils.cx(_styles, "icon-6")}
                    widget={{
                      type: "icon",
                      icon: "dropdown-toggle",
                    }}
                  />
                  <_Builtin.Block className={_utils.cx(_styles, "text-block-36")} tag="div">
                    {"Event calender"}
                  </_Builtin.Block>
                  <_Builtin.Block className={_utils.cx(_styles, "div-block-167")} tag="div" />
                </_Builtin.DropdownToggle>
                <_Builtin.DropdownList className={_utils.cx(_styles, "dropdown-list-4")} tag="nav">
                  <_Builtin.Paragraph className={_utils.cx(_styles, "paragraph-140")}>
                    {
                      "Here you can find upcoming events in Potsdam. The calendar is managed by Bene and the events are regularly advertised via our email and social media channels."
                    }
                  </_Builtin.Paragraph>
                </_Builtin.DropdownList>
              </_Builtin.DropdownWrapper>
              <_Builtin.DropdownWrapper
                className={_utils.cx(_styles, "accordeon-ch")}
                data-w-id="71839a0b-710d-2111-871f-d06c7e281471"
                tag="div"
                delay={0}
                hover={false}
              >
                <_Builtin.DropdownToggle
                  className={_utils.cx(_styles, "dropdown-toggle-3")}
                  tag="div"
                >
                  <_Builtin.Icon
                    className={_utils.cx(_styles, "icon-6")}
                    widget={{
                      type: "icon",
                      icon: "dropdown-toggle",
                    }}
                  />
                  <_Builtin.Block className={_utils.cx(_styles, "text-block-36")} tag="div">
                    {"ClimateMatch"}
                  </_Builtin.Block>
                  <_Builtin.Block className={_utils.cx(_styles, "div-block-167")} tag="div" />
                </_Builtin.DropdownToggle>
                <_Builtin.DropdownList
                  className={_utils.cj(_utils.cx(_styles, "dropdown-list-4"), "w-clearfix")}
                  tag="nav"
                >
                  <_Builtin.Paragraph className={_utils.cx(_styles, "paragraph-140")}>
                    {
                      "Answer 4 short questions and you've found the right project. Write to the person responsible right away and get started!"
                    }
                  </_Builtin.Paragraph>
                  <_Builtin.Link
                    className={_utils.cx(_styles, "button-in-main-color")}
                    button={true}
                    block=""
                    options={{
                      href: "https://climateconnect.earth/en/climatematch?from_hub=potsdam",
                      target: "_blank",
                    }}
                  >
                    {"Match now"}
                  </_Builtin.Link>
                </_Builtin.DropdownList>
              </_Builtin.DropdownWrapper>
              <_Builtin.DropdownWrapper
                className={_utils.cx(_styles, "accordeon-ch")}
                data-w-id="71839a0b-710d-2111-871f-d06c7e28147c"
                tag="div"
                delay={0}
                hover={false}
              >
                <_Builtin.DropdownToggle
                  className={_utils.cx(_styles, "dropdown-toggle-3")}
                  tag="div"
                >
                  <_Builtin.Icon
                    className={_utils.cx(_styles, "icon-6")}
                    widget={{
                      type: "icon",
                      icon: "dropdown-toggle",
                    }}
                  />
                  <_Builtin.Block className={_utils.cx(_styles, "text-block-36")} tag="div">
                    {"Ideas"}
                  </_Builtin.Block>
                  <_Builtin.Block className={_utils.cx(_styles, "div-block-167")} tag="div" />
                </_Builtin.DropdownToggle>
                <_Builtin.DropdownList
                  className={_utils.cj(_utils.cx(_styles, "dropdown-list-4"), "w-clearfix")}
                  tag="nav"
                >
                  <_Builtin.Paragraph className={_utils.cx(_styles, "paragraph-140")}>
                    {
                      "Do you have an idea and are looking for support to realise it? Use the ideas board to find the right people to help you."
                    }
                  </_Builtin.Paragraph>
                  <_Builtin.Link
                    className={_utils.cx(_styles, "button-in-main-color")}
                    button={true}
                    block=""
                    options={{
                      href: "https://climateconnect.earth/en/share",
                      target: "_blank",
                    }}
                  >
                    {"Share an idea"}
                  </_Builtin.Link>
                </_Builtin.DropdownList>
              </_Builtin.DropdownWrapper>
              <_Builtin.DropdownWrapper
                className={_utils.cx(_styles, "accordeon-ch")}
                data-w-id="71839a0b-710d-2111-871f-d06c7e281487"
                tag="div"
                delay={0}
                hover={false}
              >
                <_Builtin.DropdownToggle
                  className={_utils.cx(_styles, "dropdown-toggle-3")}
                  tag="div"
                >
                  <_Builtin.Icon
                    className={_utils.cx(_styles, "icon-6")}
                    widget={{
                      type: "icon",
                      icon: "dropdown-toggle",
                    }}
                  />
                  <_Builtin.Block className={_utils.cx(_styles, "text-block-36")} tag="div">
                    {"Chat and connect"}
                  </_Builtin.Block>
                  <_Builtin.Block className={_utils.cx(_styles, "div-block-167")} tag="div" />
                </_Builtin.DropdownToggle>
                <_Builtin.DropdownList className={_utils.cx(_styles, "dropdown-list-4")} tag="nav">
                  <_Builtin.Paragraph className={_utils.cx(_styles, "paragraph-140")}>
                    {
                      "You can reach all climate activists from your city via the Climate Connect chat. Write a message if you would like to take part in a project or have a question."
                    }
                  </_Builtin.Paragraph>
                </_Builtin.DropdownList>
              </_Builtin.DropdownWrapper>
            </_Builtin.Block>
          </_Builtin.Block>
        </_Builtin.BlockContainer>
      </_Builtin.Section>
      <_Builtin.Section
        className={_utils.cx(_styles, "section-supporter-ch")}
        grid={{
          type: "section",
        }}
        tag="section"
      >
        <_Builtin.BlockContainer
          grid={{
            type: "container",
          }}
          tag="div"
        >
          <_Builtin.Heading className={_utils.cx(_styles, "heading-121")} tag="h1">
            {"Our supporters about the ClimateHub"}
          </_Builtin.Heading>
        </_Builtin.BlockContainer>
      </_Builtin.Section>
      <_Builtin.Section
        className={_utils.cx(_styles, "quotes-donate-wo-cms")}
        grid={{
          type: "section",
        }}
        tag="div"
      >
        <_Builtin.Image
          className={_utils.cx(_styles, "image-79")}
          loading="lazy"
          width="auto"
          height="auto"
          alt=""
          src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/638db96c0d5f31c3b0ca3c57_Icon%20material-format-quote.svg"
        />
        <_Builtin.Block className={_utils.cx(_styles, "quoteswrapper")} tag="div">
          <QuoteWOCms
            nameQuote="Thomas Niemeyer"
            quote="„Die Energiewende ist eine gesamtgesellschaftliche Aufgabe, die in der Zusammenarbeit zwischen der EWP und den Bürgerinnen und Bürgern zum Nutzen aller gemeistert werden wird. Ich freue mich, dass wir dafür den ClimateHub als Bindeglied in Potsdam haben“"
            bezeichnung="Energie und Wasser Potsdam GmbH"
            pictureQuote="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/663b14a7e0dc4ddce9c96559_65e83366d97908d7bc1e83e3_IMG_1368-min.jpg"
          />
          <QuoteWOCms
            nameQuote="Kinderarzt Praxis Rübenstrunk Kiesheyer"
            quote='"Wir unterstützen den ClimateHub, da die Politik oft nicht schnell genug handelt. Deshalb möchten wir das Engagement der Zivilgesellschaft im Klimaschutz bestmöglich fördern!"'
            bezeichnung="Regelmäßige Spender"
            pictureQuote="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/6634a0f48e36a7269cb62ac2_6401d3a168e6695e79b2d97d_DSC00421%20klein-min.jpg"
          />
          <QuoteWOCms
            nameQuote="Kerstin Lopau"
            quote="“Der ClimateHub hat mir als Neu-Potsdamerin einen super Start in die lokale Klima-Szene gegeben. Auf einen Blick finde ich dort Gruppen, Ideen, Projekte und Events. Mit Hilfe des ClimateHubs gründen wir jetzt unsere Potsdamer Bürgerenergiegenossenschaft und finden neue Mitstreiter*innen.”"
            pictureQuote="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/663b14a768ec0804b0400418_65e833fbc577e603cce2228d_Kerstin%20Lopau-min.jpeg"
            bezeichnung="Mitglied des ClimateHub Potsdam"
          />
          <QuoteWOCms
            nameQuote="Jonas Höhne"
            quote='"Gemeinsam können wir die Wärmewende in Potsdam so gestalten, dass alle davon profitieren können! Der ClimateHub Potsdam hat mit dem BürgerEnergieTag einen super Grundstein dafür gelegt."'
            pictureQuote="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/663b14a7ec6144787d5ce105_65e83a801a146057bc00d375_Jonas%20Hoehne%20square-min.jpeg"
            bezeichnung="Teilnehmer BürgerEnergieTag 2024"
          />
          <QuoteWOCms
            nameQuote="Bertram Stehmann"
            quote='"Ich unterstütze Climate Connect, weil hier ein wertvoller Beitrag zur Vernetzung zahlreicher kleiner und großer Aktionen und Kampagnen geleistet wird."'
            bezeichnung="Regelmäßiger Spender"
            pictureQuote="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/6634a136a2596437a4a565dd_ASC_9908%20(1)-min.jpg"
          />
        </_Builtin.Block>
      </_Builtin.Section>
      <_Builtin.Section
        className={_utils.cx(_styles, "quotes-donate-2")}
        grid={{
          type: "section",
        }}
        tag="div"
      >
        <_Builtin.Image
          className={_utils.cx(_styles, "image-79")}
          loading="lazy"
          width="auto"
          height="auto"
          alt=""
          src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/638db96c0d5f31c3b0ca3c57_Icon%20material-format-quote.svg"
        />
        <_Builtin.Block className={_utils.cx(_styles, "quoteswrapper")} tag="div">
          <_Builtin.NotSupported _atom="DynamoWrapper" />
        </_Builtin.Block>
      </_Builtin.Section>
      <_Builtin.Section
        className={_utils.cx(_styles, "section-orgs-ch")}
        grid={{
          type: "section",
        }}
        tag="section"
      >
        <_Builtin.BlockContainer
          grid={{
            type: "container",
          }}
          tag="div"
        >
          <_Builtin.Block tag="div">
            <_Builtin.Block tag="div">
              <_Builtin.Heading tag="h1">{"Find your group"}</_Builtin.Heading>
              <_Builtin.Paragraph>
                {"You can find all active climate groups in Potsdam on the ClimateHub"}
              </_Builtin.Paragraph>
              <_Builtin.SliderWrapper
                className={_utils.cx(_styles, "slider-orgs-ch")}
                navSpacing={3}
                navShadow={false}
                autoplay={false}
                delay={4000}
                iconArrows={true}
                animation="slide"
                navNumbers={false}
                easing="ease"
                navRound={true}
                hideArrows={false}
                disableSwipe={false}
                duration={500}
                infinite={true}
                autoMax={0}
                navInvert={false}
              >
                <_Builtin.SliderMask className={_utils.cx(_styles, "mask-4")}>
                  <_Builtin.SliderSlide className={_utils.cx(_styles, "slide-12")} tag="div">
                    <_Builtin.Block className={_utils.cx(_styles, "slide-wrapper")} tag="div">
                      <_Builtin.Block className={_utils.cx(_styles, "div-org-cards")} tag="div">
                        <_Builtin.Image
                          className={_utils.cx(_styles, "image-org-logo")}
                          loading="lazy"
                          width="auto"
                          height="auto"
                          alt="sneep Logo"
                          src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bf7dd5f3329028b31effb_277ad08ee6ea0f75097b7b79cf31f0c28358daa2.jpeg"
                        />
                        <_Builtin.Block className={_utils.cx(_styles, "text-block-38")} tag="div">
                          {"Hochschulgruppe"}
                        </_Builtin.Block>
                        <_Builtin.Heading className={_utils.cx(_styles, "heading-118")} tag="h3">
                          {"sneep"}
                        </_Builtin.Heading>
                        <_Builtin.Paragraph className={_utils.cx(_styles, "paragraph-139")}>
                          {
                            "Wir sind eine studentische Organisation an der Friedrich-Alexander-Universität, die sich mit Nachhaltigkeitsthemen beschäftigt."
                          }
                        </_Builtin.Paragraph>
                        <_Builtin.Block className={_utils.cx(_styles, "div-block-158")} tag="div">
                          <_Builtin.Block className={_utils.cx(_styles, "div-block-159")} tag="div">
                            <_Builtin.Image
                              className={_utils.cx(_styles, "image-124")}
                              loading="lazy"
                              width="auto"
                              height="auto"
                              alt="Icon Gruppe"
                              src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bf5f26f6e865b2f5ebeea_Pfad%2010815.svg"
                            />
                            <_Builtin.Block
                              className={_utils.cx(_styles, "text-block-34")}
                              tag="div"
                            >
                              {"15"}
                            </_Builtin.Block>
                          </_Builtin.Block>
                          <_Builtin.Block className={_utils.cx(_styles, "div-block-159")} tag="div">
                            <_Builtin.Image
                              className={_utils.cx(_styles, "image-124")}
                              loading="lazy"
                              width="auto"
                              height="auto"
                              alt="Icon Projekt"
                              src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bf5f2d308f8ac4a487899_content_paste_black_24dp.svg"
                            />
                            <_Builtin.Block
                              className={_utils.cx(_styles, "text-block-34")}
                              tag="div"
                            >
                              {"7"}
                            </_Builtin.Block>
                          </_Builtin.Block>
                        </_Builtin.Block>
                      </_Builtin.Block>
                    </_Builtin.Block>
                  </_Builtin.SliderSlide>
                  <_Builtin.SliderSlide tag="div">
                    <_Builtin.Block className={_utils.cx(_styles, "slide-wrapper")} tag="div">
                      <_Builtin.Block
                        className={_utils.cj(
                          _utils.cx(_styles, "div-project-card-slide"),
                          "w-clearfix"
                        )}
                        tag="div"
                      >
                        <_Builtin.Image
                          className={_utils.cx(_styles, "image-120")}
                          width="auto"
                          height="auto"
                          loading="lazy"
                          alt=""
                          src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bf9ba4e33d016c1da2c9c_1013944031e70ee06f7743005c3dedcc73268601.jpeg"
                        />
                        <_Builtin.Heading className={_utils.cx(_styles, "heading-118")} tag="h3">
                          {"Klimafreundliche Großküchen in Erlangen"}
                        </_Builtin.Heading>
                        <_Builtin.Block className={_utils.cx(_styles, "text-block-33")} tag="div">
                          {"Durch den ClimateHub möglich gemacht"}
                        </_Builtin.Block>
                        <_Builtin.Paragraph className={_utils.cx(_styles, "paragraph-139")}>
                          {
                            "Stecker-Solaer ist eine ehrenamtliche Balkonsolarberatung die durch den ClimateHub Erlangen und unseren Klimaverentzer ermöglicht wurde. Mit inzwischen xxx Beratungen und vielen Infoständen konnten unzählige Anlagen möglich gemacht werden."
                          }
                        </_Builtin.Paragraph>
                        <_Builtin.Block className={_utils.cx(_styles, "div-block-158")} tag="div">
                          <_Builtin.Block className={_utils.cx(_styles, "div-block-159")} tag="div">
                            <_Builtin.Image
                              className={_utils.cx(_styles, "image-121")}
                              width="auto"
                              height="auto"
                              loading="lazy"
                              alt="Herz icon"
                              src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bd91736364e7718c3a6e0_favorite_FILL1_wght400_GRAD0_opsz48.svg"
                            />
                            <_Builtin.Block
                              className={_utils.cx(_styles, "text-block-34")}
                              tag="div"
                            >
                              {"5"}
                            </_Builtin.Block>
                          </_Builtin.Block>
                          <_Builtin.Block className={_utils.cx(_styles, "div-block-159")} tag="div">
                            <_Builtin.Image
                              className={_utils.cx(_styles, "image-121")}
                              width="auto"
                              height="auto"
                              loading="lazy"
                              alt="Kommentar Icon"
                              src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bd91736364e7718c3a6e4_mode_comment_FILL0_wght400_GRAD0_opsz48.svg"
                            />
                            <_Builtin.Block
                              className={_utils.cx(_styles, "text-block-34")}
                              tag="div"
                            >
                              {"2"}
                            </_Builtin.Block>
                          </_Builtin.Block>
                        </_Builtin.Block>
                        <_Builtin.Link
                          className={_utils.cx(_styles, "button-in-main-color")}
                          button={true}
                          block=""
                          options={{
                            href: "#",
                          }}
                        >
                          {"Mehr erfahren"}
                        </_Builtin.Link>
                      </_Builtin.Block>
                    </_Builtin.Block>
                  </_Builtin.SliderSlide>
                  <_Builtin.SliderSlide tag="div">
                    <_Builtin.Block className={_utils.cx(_styles, "slide-wrapper")} tag="div">
                      <_Builtin.Block
                        className={_utils.cj(
                          _utils.cx(_styles, "div-project-card-slide"),
                          "w-clearfix"
                        )}
                        tag="div"
                      >
                        <_Builtin.Image
                          className={_utils.cx(_styles, "image-120")}
                          width="auto"
                          height="auto"
                          loading="lazy"
                          alt=""
                          src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/653ec8280c6cbb7e613256d9_nmb-Klimakonferenz-2022-0265-min.jpg"
                        />
                        <_Builtin.Heading className={_utils.cx(_styles, "heading-118")} tag="h3">
                          {"Klima-Mitmach-Tage"}
                        </_Builtin.Heading>
                        <_Builtin.Block className={_utils.cx(_styles, "text-block-33")} tag="div">
                          {"Durch den ClimateHub möglich gemacht"}
                        </_Builtin.Block>
                        <_Builtin.Paragraph className={_utils.cx(_styles, "paragraph-139")}>
                          {
                            "Bereits 3 Erlanger Klima-Mitmach-Tage haben wir organisiert. So konnten insgeamt über 200 Menschen zum mitmachen motiviert werden. Außerdem sind so zahlreiche neue Projekt für Erlangen entstanden."
                          }
                        </_Builtin.Paragraph>
                        <_Builtin.Block className={_utils.cx(_styles, "div-block-158")} tag="div">
                          <_Builtin.Block className={_utils.cx(_styles, "div-block-159")} tag="div">
                            <_Builtin.Image
                              className={_utils.cx(_styles, "image-121")}
                              width="auto"
                              height="auto"
                              loading="lazy"
                              alt="Herz icon"
                              src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bd91736364e7718c3a6e0_favorite_FILL1_wght400_GRAD0_opsz48.svg"
                            />
                            <_Builtin.Block
                              className={_utils.cx(_styles, "text-block-34")}
                              tag="div"
                            >
                              {"10"}
                            </_Builtin.Block>
                          </_Builtin.Block>
                          <_Builtin.Block className={_utils.cx(_styles, "div-block-159")} tag="div">
                            <_Builtin.Image
                              className={_utils.cx(_styles, "image-121")}
                              width="auto"
                              height="auto"
                              loading="lazy"
                              alt="Kommentar Icon"
                              src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bd91736364e7718c3a6e4_mode_comment_FILL0_wght400_GRAD0_opsz48.svg"
                            />
                            <_Builtin.Block
                              className={_utils.cx(_styles, "text-block-34")}
                              tag="div"
                            >
                              {"3"}
                            </_Builtin.Block>
                          </_Builtin.Block>
                        </_Builtin.Block>
                        <_Builtin.Link
                          className={_utils.cx(_styles, "button-in-main-color")}
                          button={true}
                          block=""
                          options={{
                            href: "#",
                          }}
                        >
                          {"Mehr erfahren"}
                        </_Builtin.Link>
                      </_Builtin.Block>
                    </_Builtin.Block>
                  </_Builtin.SliderSlide>
                </_Builtin.SliderMask>
                <_Builtin.SliderArrow dir="left">
                  <_Builtin.Icon
                    widget={{
                      type: "icon",
                      icon: "slider-left",
                    }}
                  />
                </_Builtin.SliderArrow>
                <_Builtin.SliderArrow dir="right">
                  <_Builtin.Icon
                    widget={{
                      type: "icon",
                      icon: "slider-right",
                    }}
                  />
                </_Builtin.SliderArrow>
                <_Builtin.SliderNav className={_utils.cx(_styles, "slide-nav-4")} />
              </_Builtin.SliderWrapper>
            </_Builtin.Block>
            <_Builtin.Block className={_utils.cx(_styles, "div-block-orgs")} tag="div">
              <_Builtin.Link
                className={_utils.cx(_styles, "div-org-cards")}
                button={false}
                block="inline"
                options={{
                  href: "https://climateconnect.earth/de/organizations/fridays-for-future-potsdam",
                }}
              >
                <_Builtin.Image
                  className={_utils.cx(_styles, "image-org-logo")}
                  loading="lazy"
                  width="auto"
                  height="auto"
                  alt=""
                  src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/65aa59bfc9515d144bae3829_c5647429195aae317f9be8fad50a9f3ceffb20e2.jpeg"
                />
                <_Builtin.Block className={_utils.cx(_styles, "text-block-38")} tag="div">
                  {"social movment"}
                </_Builtin.Block>
                <_Builtin.Heading className={_utils.cx(_styles, "heading-118")} tag="h3">
                  {"Fridays for Future Potsdam"}
                </_Builtin.Heading>
                <_Builtin.Paragraph className={_utils.cx(_styles, "paragraph-139")}>
                  {
                    "We are Fridays for Future Potsdam. There is a weekly plenary session, which takes place alternately on Monday or Tuesday at Madia in the city center."
                  }
                </_Builtin.Paragraph>
                <_Builtin.Block className={_utils.cx(_styles, "div-block-158")} tag="div">
                  <_Builtin.Block className={_utils.cx(_styles, "div-block-159")} tag="div">
                    <_Builtin.Image
                      className={_utils.cx(_styles, "image-124")}
                      loading="lazy"
                      width="auto"
                      height="auto"
                      alt="Icon Gruppe"
                      src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bf5f26f6e865b2f5ebeea_Pfad%2010815.svg"
                    />
                    <_Builtin.Block className={_utils.cx(_styles, "text-block-34")} tag="div">
                      {"15"}
                    </_Builtin.Block>
                  </_Builtin.Block>
                  <_Builtin.Block className={_utils.cx(_styles, "div-block-159")} tag="div">
                    <_Builtin.Image
                      className={_utils.cx(_styles, "image-124")}
                      loading="lazy"
                      width="auto"
                      height="auto"
                      alt="Icon Projekt"
                      src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bf5f2d308f8ac4a487899_content_paste_black_24dp.svg"
                    />
                    <_Builtin.Block className={_utils.cx(_styles, "text-block-34")} tag="div">
                      {"2"}
                    </_Builtin.Block>
                  </_Builtin.Block>
                </_Builtin.Block>
              </_Builtin.Link>
              <_Builtin.Link
                className={_utils.cx(_styles, "div-org-cards")}
                button={false}
                block="inline"
                options={{
                  href: "https://climateconnect.earth/de/organizations/brandenburg-21-ev",
                }}
              >
                <_Builtin.Image
                  className={_utils.cx(_styles, "image-org-logo")}
                  loading="lazy"
                  width="auto"
                  height="auto"
                  alt=""
                  src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/65aa59f83d353c8390758ffe_28512a15859605fcd9a4bdf683ad7beb3ab604a9.jpeg"
                />
                <_Builtin.Block className={_utils.cx(_styles, "text-block-38")} tag="div">
                  {"association"}
                </_Builtin.Block>
                <_Builtin.Heading className={_utils.cx(_styles, "heading-118")} tag="h3">
                  {"Brandenburg 21 e.V."}
                </_Builtin.Heading>
                <_Builtin.Paragraph className={_utils.cx(_styles, "paragraph-139")}>
                  {
                    "Brandenburg 21 is committed to implementing the 2030 Agenda throughout the state. Our work focuses on sustainable municipal and regional development, ESD and sustainable management."
                  }
                </_Builtin.Paragraph>
                <_Builtin.Block className={_utils.cx(_styles, "div-block-158")} tag="div">
                  <_Builtin.Block className={_utils.cx(_styles, "div-block-159")} tag="div">
                    <_Builtin.Image
                      className={_utils.cx(_styles, "image-124")}
                      loading="lazy"
                      width="auto"
                      height="auto"
                      alt="Icon Gruppe"
                      src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bf5f26f6e865b2f5ebeea_Pfad%2010815.svg"
                    />
                    <_Builtin.Block className={_utils.cx(_styles, "text-block-34")} tag="div">
                      {"1"}
                    </_Builtin.Block>
                  </_Builtin.Block>
                  <_Builtin.Block className={_utils.cx(_styles, "div-block-159")} tag="div">
                    <_Builtin.Image
                      className={_utils.cx(_styles, "image-124")}
                      loading="lazy"
                      width="auto"
                      height="auto"
                      alt="Icon Projekt"
                      src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bf5f2d308f8ac4a487899_content_paste_black_24dp.svg"
                    />
                    <_Builtin.Block className={_utils.cx(_styles, "text-block-34")} tag="div">
                      {"10"}
                    </_Builtin.Block>
                  </_Builtin.Block>
                </_Builtin.Block>
              </_Builtin.Link>
              <_Builtin.Link
                className={_utils.cx(_styles, "div-org-cards")}
                button={false}
                block="inline"
                options={{
                  href: "https://climateconnect.earth/de/organizations/tschuss-erdgas",
                }}
              >
                <_Builtin.Image
                  className={_utils.cx(_styles, "image-org-logo")}
                  loading="lazy"
                  width="auto"
                  height="auto"
                  alt=""
                  src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/65aa5bbe319ccc61a04b6a42_eade3dd00a78d358717239da3fe7da5b04cbdbca.jpeg"
                />
                <_Builtin.Block className={_utils.cx(_styles, "text-block-38")} tag="div">
                  {"volunteer group"}
                </_Builtin.Block>
                <_Builtin.Heading className={_utils.cx(_styles, "heading-118")} tag="h3">
                  {"Tschüss Erdgas!"}
                </_Builtin.Heading>
                <_Builtin.Paragraph className={_utils.cx(_styles, "paragraph-139")}>
                  {
                    "We are the citizens' petition for Potsdam's energy transition. Our goal: an affordable, sustainable and climate-friendly energy supply for everyone. The collection of signatures is underway: 14,500 signatures by September 2023!"
                  }
                </_Builtin.Paragraph>
                <_Builtin.Block className={_utils.cx(_styles, "div-block-158")} tag="div">
                  <_Builtin.Block className={_utils.cx(_styles, "div-block-159")} tag="div">
                    <_Builtin.Image
                      className={_utils.cx(_styles, "image-124")}
                      loading="lazy"
                      width="auto"
                      height="auto"
                      alt="Icon Gruppe"
                      src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bf5f26f6e865b2f5ebeea_Pfad%2010815.svg"
                    />
                    <_Builtin.Block className={_utils.cx(_styles, "text-block-34")} tag="div">
                      {"7"}
                    </_Builtin.Block>
                  </_Builtin.Block>
                  <_Builtin.Block className={_utils.cx(_styles, "div-block-159")} tag="div">
                    <_Builtin.Image
                      className={_utils.cx(_styles, "image-124")}
                      loading="lazy"
                      width="auto"
                      height="auto"
                      alt="Icon Projekt"
                      src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bf5f2d308f8ac4a487899_content_paste_black_24dp.svg"
                    />
                    <_Builtin.Block className={_utils.cx(_styles, "text-block-34")} tag="div">
                      {"2"}
                    </_Builtin.Block>
                  </_Builtin.Block>
                </_Builtin.Block>
              </_Builtin.Link>
            </_Builtin.Block>
          </_Builtin.Block>
          <_Builtin.Link
            className={_utils.cx(_styles, "link-block-7")}
            button={false}
            block="inline"
            options={{
              href: "https://climateconnect.earth/en/hubs/potsdam?&#organizations",
            }}
          >
            <_Builtin.Block className={_utils.cx(_styles, "text-block-37")} tag="div">
              {"Discover all organisations"}
            </_Builtin.Block>
            <_Builtin.Image
              className={_utils.cx(_styles, "image-123")}
              loading="lazy"
              width="auto"
              height="auto"
              alt="arrow donw"
              src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/6166b718196ee9648f418a7a_Icon%20ionic-ios-arrow-down.svg"
            />
          </_Builtin.Link>
        </_Builtin.BlockContainer>
      </_Builtin.Section>
      <_Builtin.Section
        className={_utils.cx(_styles, "climatematch")}
        grid={{
          type: "section",
        }}
        tag="section"
      >
        <_Builtin.BlockContainer
          grid={{
            type: "container",
          }}
          tag="div"
        >
          <_Builtin.Block className={_utils.cx(_styles, "div-block-214")} tag="div">
            <_Builtin.Block
              className={_utils.cj(_utils.cx(_styles, "div-block-215"), "w-clearfix")}
              tag="div"
            >
              <_Builtin.Heading className={_utils.cx(_styles, "heading-138")} tag="h2">
                {"4 questions to happiness"}
              </_Builtin.Heading>
              <_Builtin.Paragraph className={_utils.cx(_styles, "paragraph-153")}>
                {
                  "The ClimateMatch helps you to find the right group or the perfect project for your commitment in 4 short questions. "
                }
              </_Builtin.Paragraph>
              <_Builtin.Link
                className={_utils.cx(_styles, "button-in-main-color")}
                button={true}
                block=""
                options={{
                  href: "https://climateconnect.earth/en/climatematch?from_hub=potsdam",
                  target: "_blank",
                }}
              >
                {"Do the ClimateMatch"}
              </_Builtin.Link>
            </_Builtin.Block>
            <_Builtin.Block className={_utils.cx(_styles, "cm-4-points-wrapper")} tag="div">
              <_Builtin.Block className={_utils.cx(_styles, "cm-point-wrapper")} tag="div">
                <_Builtin.Block className={_utils.cx(_styles, "text-block-56")} tag="div">
                  {"1."}
                </_Builtin.Block>
                <_Builtin.Block className={_utils.cx(_styles, "text-block-57")} tag="div">
                  {"Your favorite topic"}
                </_Builtin.Block>
              </_Builtin.Block>
              <_Builtin.Block className={_utils.cx(_styles, "cm-point-wrapper")} tag="div">
                <_Builtin.Block className={_utils.cx(_styles, "text-block-56")} tag="div">
                  {"2."}
                </_Builtin.Block>
                <_Builtin.Block className={_utils.cx(_styles, "text-block-57")} tag="div">
                  {"Your skills"}
                </_Builtin.Block>
              </_Builtin.Block>
              <_Builtin.Block className={_utils.cx(_styles, "cm-point-wrapper")} tag="div">
                <_Builtin.Block className={_utils.cx(_styles, "text-block-56")} tag="div">
                  {"3."}
                </_Builtin.Block>
                <_Builtin.Block className={_utils.cx(_styles, "text-block-57")} tag="div">
                  {"Your perfect engagement"}
                </_Builtin.Block>
              </_Builtin.Block>
              <_Builtin.Block className={_utils.cx(_styles, "cm-point-wrapper")} tag="div">
                <_Builtin.Block className={_utils.cx(_styles, "text-block-56")} tag="div">
                  {"4."}
                </_Builtin.Block>
                <_Builtin.Block className={_utils.cx(_styles, "text-block-57")} tag="div">
                  {"Your Impact 🎉"}
                </_Builtin.Block>
              </_Builtin.Block>
            </_Builtin.Block>
          </_Builtin.Block>
        </_Builtin.BlockContainer>
      </_Builtin.Section>
      <_Builtin.Section
        className={_utils.cx(_styles, "section-org-supporter-ch")}
        grid={{
          type: "section",
        }}
        tag="section"
      >
        <_Builtin.BlockContainer
          grid={{
            type: "container",
          }}
          tag="div"
        >
          <_Builtin.Heading className={_utils.cx(_styles, "heading-122")} tag="h1">
            {"Our supporters and partners"}
          </_Builtin.Heading>
          <_Builtin.Paragraph className={_utils.cx(_styles, "paragraph-141")}>
            {
              "The members of the ClimateHub bring it to life - our partners made the ClimateHub possible in the first place."
            }
          </_Builtin.Paragraph>
          <_Builtin.Block className={_utils.cx(_styles, "div-block-206")} tag="div">
            <_Builtin.Image
              loading="lazy"
              width="auto"
              height="auto"
              alt=""
              src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/65aa5c8a1aa2c0222cdd9ea9_Untitled.jpg"
            />
            <_Builtin.Image
              loading="lazy"
              width="auto"
              height="150"
              alt=""
              src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/65aa5d0caa4dcf672fc9148f_d17d7ea3.1200x900.jpg"
            />
            <_Builtin.Image
              loading="lazy"
              width="300"
              height="auto"
              alt=""
              src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/65aa5d308149193e57161089_zenitar_logo.jpg"
            />
          </_Builtin.Block>
        </_Builtin.BlockContainer>
      </_Builtin.Section>
      <_Builtin.Section
        className={_utils.cx(_styles, "section-ch-donate")}
        grid={{
          type: "section",
        }}
        tag="div"
      >
        <_Builtin.Container className={_utils.cx(_styles, "container-50")} tag="div">
          <_Builtin.Image
            className={_utils.cx(_styles, "image-81")}
            loading="lazy"
            width="316"
            height="auto"
            alt=""
            src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/63890c308ada66f7b5db9929_DSC09085-min.JPG"
          />
          <_Builtin.Image
            className={_utils.cx(_styles, "image-82")}
            loading="lazy"
            width="399"
            height="auto"
            alt=""
            src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/644bbd476e31ff5fe90da6f9__DSC3970.jpg"
          />
          <_Builtin.Block className={_utils.cx(_styles, "div-block-111-copy")} tag="div">
            <_Builtin.Heading className={_utils.cx(_styles, "heading-101-copy")} tag="h1">
              {"Donate now and make the ClimateHub Potsdam possible!"}
            </_Builtin.Heading>
            <_Builtin.Paragraph className={_utils.cx(_styles, "paragraph-124")}>
              {
                "For as little as €2 a month, you can help ClimateHub make a difference in the long term. This makes us less dependent on annual subsidies and grants. This gives us a lot of planning security and we can achieve more."
              }
            </_Builtin.Paragraph>
            <_Builtin.Block className={_utils.cx(_styles, "dono-page-button-wrapper")} tag="div">
              <_Builtin.Block
                className={_utils.cj(_utils.cx(_styles, "div-block-112"), "w-clearfix")}
                tag="div"
              >
                <_Builtin.Block className={_utils.cx(_styles, "text-block-16")} tag="div">
                  {"Support the Climate Connect gUG:"}
                </_Builtin.Block>
                <_Builtin.Link
                  className={_utils.cx(_styles, "button-in-main-color", "dono-page")}
                  button={true}
                  block=""
                  options={{
                    href: "#Donation-setction",
                  }}
                >
                  {"Donate NOW"}
                </_Builtin.Link>
              </_Builtin.Block>
            </_Builtin.Block>
          </_Builtin.Block>
          <_Builtin.Image
            className={_utils.cx(_styles, "image-83")}
            loading="lazy"
            width="200"
            height="auto"
            alt="Projekt Karte von der Climate Connect plattform: Klimakalender 2023"
            src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/638a753c8a6a0bb7dfa8678b_Gruppe%208312.png"
          />
          <_Builtin.Image
            className={_utils.cx(_styles, "image-84")}
            loading="lazy"
            width="341"
            height="auto"
            alt="Mann zeigt auf Karten die an einer Pinnwand hängen"
            src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/644bbeadad2e7a5201012830__DSC4692.jpg"
          />
        </_Builtin.Container>
      </_Builtin.Section>
      <_Builtin.Section
        className={_utils.cx(_styles, "footer")}
        grid={{
          type: "section",
        }}
        tag="footer"
        id="footer"
      >
        <_Builtin.Container className={_utils.cx(_styles, "container-2")} tag="div">
          <_Builtin.Block className={_utils.cx(_styles, "footer-flex-container")} tag="div">
            <_Builtin.Block className={_utils.cx(_styles, "div-block-6")} tag="div">
              <_Builtin.Heading className={_utils.cx(_styles, "footer-heading")} tag="h2">
                {"Allgemein"}
              </_Builtin.Heading>
              <_Builtin.List className={_utils.cx(_styles, "list-footer")} tag="ul" unstyled={true}>
                <_Builtin.ListItem
                  list={{
                    type: "",
                  }}
                >
                  <_Builtin.Link
                    className={_utils.cx(_styles, "footer-link")}
                    button={false}
                    block=""
                    options={{
                      href: "https://climateconnect.earth/de/faq",
                      target: "_blank",
                    }}
                  >
                    {"FAQ"}
                  </_Builtin.Link>
                </_Builtin.ListItem>
                <_Builtin.ListItem
                  list={{
                    type: "",
                  }}
                >
                  <_Builtin.Link
                    className={_utils.cx(_styles, "footer-link")}
                    button={false}
                    block=""
                    options={{
                      href: "https://climateconnect.earth/de/donate",
                      target: "_blank",
                    }}
                  >
                    {"Spenden"}
                  </_Builtin.Link>
                </_Builtin.ListItem>
                <_Builtin.ListItem
                  list={{
                    type: "",
                  }}
                >
                  <_Builtin.Link
                    className={_utils.cx(_styles, "footer-link")}
                    button={false}
                    block=""
                    options={{
                      href: "https://climateconnect.earth/de/about",
                      target: "_blank",
                    }}
                  >
                    {"Über uns"}
                  </_Builtin.Link>
                </_Builtin.ListItem>
                <_Builtin.ListItem
                  list={{
                    type: "",
                  }}
                >
                  <_Builtin.Link
                    className={_utils.cx(_styles, "footer-link")}
                    button={false}
                    block=""
                    options={{
                      href: "https://climateconnect.earth/de/team",
                    }}
                  >
                    {"Team"}
                  </_Builtin.Link>
                </_Builtin.ListItem>
                <_Builtin.ListItem
                  list={{
                    type: "",
                  }}
                >
                  <_Builtin.Link
                    className={_utils.cx(_styles, "footer-link")}
                    button={false}
                    block=""
                    options={{
                      href: "https://climateconnect.earth/de/blog",
                      target: "_blank",
                    }}
                  >
                    {"Blog"}
                  </_Builtin.Link>
                </_Builtin.ListItem>
              </_Builtin.List>
            </_Builtin.Block>
            <_Builtin.Block className={_utils.cx(_styles, "div-block-6")} tag="div">
              <_Builtin.Heading className={_utils.cx(_styles, "footer-heading")} tag="h2">
                {"Kontakt"}
              </_Builtin.Heading>
              <_Builtin.List className={_utils.cx(_styles, "list-footer")} tag="ul" unstyled={true}>
                <_Builtin.ListItem
                  list={{
                    type: "",
                  }}
                >
                  <_Builtin.Link
                    className={_utils.cx(_styles, "footer-link")}
                    button={false}
                    block=""
                    options={{
                      href: "mailto:contact@climateconnect.earth",
                    }}
                  >
                    {"Email senden"}
                  </_Builtin.Link>
                </_Builtin.ListItem>
                <_Builtin.ListItem
                  list={{
                    type: "",
                  }}
                >
                  <_Builtin.Link
                    className={_utils.cx(_styles, "footer-link")}
                    button={false}
                    block=""
                    options={{
                      href: "tel:+4915730101056",
                    }}
                  >
                    {"+4915730101056"}
                  </_Builtin.Link>
                </_Builtin.ListItem>
              </_Builtin.List>
            </_Builtin.Block>
            <_Builtin.Block className={_utils.cx(_styles, "div-block-6")} tag="div">
              <_Builtin.Heading className={_utils.cx(_styles, "footer-heading")} tag="h2">
                {"Browse"}
              </_Builtin.Heading>
              <_Builtin.List className={_utils.cx(_styles, "list-footer")} tag="ul" unstyled={true}>
                <_Builtin.ListItem
                  list={{
                    type: "",
                  }}
                >
                  <_Builtin.Link
                    className={_utils.cx(_styles, "footer-link")}
                    button={false}
                    block=""
                    options={{
                      href: "https://climateconnect.earth/de/hubs/potsdam",
                      target: "_blank",
                    }}
                  >
                    {"Projekte"}
                  </_Builtin.Link>
                </_Builtin.ListItem>
                <_Builtin.ListItem
                  list={{
                    type: "",
                  }}
                >
                  <_Builtin.Link
                    className={_utils.cx(_styles, "footer-link")}
                    button={false}
                    block=""
                    options={{
                      href: "https://climateconnect.earth/de/hubs",
                      target: "_blank",
                    }}
                  >
                    {"Hubs"}
                  </_Builtin.Link>
                </_Builtin.ListItem>
                <_Builtin.ListItem
                  list={{
                    type: "",
                  }}
                >
                  <_Builtin.Link
                    className={_utils.cx(_styles, "footer-link")}
                    button={false}
                    block=""
                    options={{
                      href: "https://climateconnect.earth/de/hubs/potsdam?&#organizations",
                      target: "_blank",
                    }}
                  >
                    {"Organisationen"}
                  </_Builtin.Link>
                </_Builtin.ListItem>
                <_Builtin.ListItem
                  list={{
                    type: "",
                  }}
                >
                  <_Builtin.Link
                    className={_utils.cx(_styles, "footer-link")}
                    button={false}
                    block=""
                    options={{
                      href: "https://climateconnect.earth/de/hubs/potsdam?&#members",
                      target: "_blank",
                    }}
                  >
                    {"Mitglieder"}
                  </_Builtin.Link>
                </_Builtin.ListItem>
              </_Builtin.List>
            </_Builtin.Block>
            <_Builtin.Block className={_utils.cx(_styles, "div-block-6")} tag="div">
              <_Builtin.Heading className={_utils.cx(_styles, "footer-heading")} tag="h2">
                {"Rechtliches"}
              </_Builtin.Heading>
              <_Builtin.List className={_utils.cx(_styles, "list-footer")} tag="ul" unstyled={true}>
                <_Builtin.ListItem
                  list={{
                    type: "",
                  }}
                >
                  <_Builtin.Link
                    className={_utils.cx(_styles, "footer-link")}
                    button={false}
                    block=""
                    options={{
                      href: "https://climateconnect.earth/de/imprint",
                      target: "_blank",
                    }}
                  >
                    {"Impressum"}
                  </_Builtin.Link>
                </_Builtin.ListItem>
                <_Builtin.ListItem
                  list={{
                    type: "",
                  }}
                >
                  <_Builtin.Link
                    className={_utils.cx(_styles, "footer-link")}
                    button={false}
                    block=""
                    options={{
                      href: "https://climateconnect.earth/de/privacy",
                      target: "_blank",
                    }}
                  >
                    {"Datenschutz"}
                  </_Builtin.Link>
                </_Builtin.ListItem>
                <_Builtin.ListItem
                  list={{
                    type: "",
                  }}
                >
                  <_Builtin.Link
                    className={_utils.cx(_styles, "footer-link")}
                    button={false}
                    block=""
                    options={{
                      href: "https://climateconnect.earth/de/terms",
                      target: "_blank",
                    }}
                  >
                    {"AGBs"}
                  </_Builtin.Link>
                </_Builtin.ListItem>
              </_Builtin.List>
            </_Builtin.Block>
            <_Builtin.Block className={_utils.cx(_styles, "div-block-2")} tag="div">
              <_Builtin.Heading className={_utils.cx(_styles, "footer-heading")} tag="h2">
                {"Newsletter"}
              </_Builtin.Heading>
              <_Builtin.List tag="ul" unstyled={true}>
                <_Builtin.ListItem
                  list={{
                    type: "",
                  }}
                >
                  <_Builtin.Link
                    className={_utils.cx(_styles, "footer-link")}
                    button={false}
                    block=""
                    options={{
                      href: "#",
                    }}
                  >
                    <_Builtin.Strong className={_utils.cx(_styles, "bold-text")}>
                      {
                        "Registriere dich, um jeden Monat Neuigkeiten über Climate Connect zu erhalten und zu Projekte informiert zu werden!"
                      }
                    </_Builtin.Strong>
                  </_Builtin.Link>
                </_Builtin.ListItem>
                <_Builtin.ListItem
                  className={_utils.cx(_styles, "list-item")}
                  list={{
                    type: "",
                  }}
                >
                  <_Builtin.Block className={_utils.cx(_styles, "div-block-3")} tag="div">
                    <_Builtin.Image
                      className={_utils.cx(_styles, "image-5")}
                      loading="lazy"
                      width="315"
                      height="auto"
                      alt=""
                      src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/6165dcc2e5ff9329ee96859e_Vereinigungsmenge%2012.svg"
                    />
                  </_Builtin.Block>
                </_Builtin.ListItem>
              </_Builtin.List>
            </_Builtin.Block>
          </_Builtin.Block>
        </_Builtin.Container>
        <_Builtin.Container className={_utils.cx(_styles, "sm-con")} tag="div">
          <_Builtin.Link
            className={_utils.cx(_styles, "social-media-icons")}
            button={false}
            block="inline"
            options={{
              href: "https://www.instagram.com/climatehub_potsdam",
              target: "_blank",
            }}
          >
            <_Builtin.Image
              className={_utils.cx(_styles, "image-3")}
              loading="lazy"
              width="33"
              height="auto"
              alt="Instagram Logo"
              src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/6165793f36636ded08114831_Icon%20awesome-instagram.svg"
            />
          </_Builtin.Link>
          <_Builtin.Link
            className={_utils.cx(_styles, "social-media-icons")}
            button={false}
            block="inline"
            options={{
              href: "https://github.com/climateconnect/climateconnect",
              target: "_blank",
            }}
          >
            <_Builtin.Image
              className={_utils.cx(_styles, "image-3")}
              loading="lazy"
              width="33"
              height="auto"
              alt="Github Logo"
              src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/6165793f8a2cfa62b31b4c86_Icon%20awesome-github.svg"
            />
          </_Builtin.Link>
          <_Builtin.Link
            className={_utils.cx(_styles, "social-media-icons")}
            button={false}
            block="inline"
            options={{
              href: "https://twitter.com/ConnectClimate",
              target: "_blank",
            }}
          >
            <_Builtin.Image
              className={_utils.cx(_styles, "image-3")}
              loading="lazy"
              width="33"
              height="auto"
              alt="Twitter Logo"
              src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/6165793f2a213d389ab790e5_Icon%20awesome-twitter.svg"
            />
          </_Builtin.Link>
          <_Builtin.Link
            className={_utils.cx(_styles, "social-media-icons")}
            button={false}
            block="inline"
            options={{
              href: "https://www.linkedin.com/company/climateconnect",
              target: "_blank",
            }}
          >
            <_Builtin.Image
              className={_utils.cx(_styles, "image-3")}
              loading="lazy"
              width="33"
              height="auto"
              alt="Linkedin Logo"
              src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/6165793f18e75a6992617a98_iconmonstr-linkedin-3.svg"
            />
          </_Builtin.Link>
          <_Builtin.Link
            className={_utils.cx(_styles, "social-media-icons")}
            button={false}
            block="inline"
            options={{
              href: "#https://www.youtube.com/channel/UC10rPriptUxYilMfvt-8Tkw",
              target: "_blank",
            }}
          >
            <_Builtin.Image
              className={_utils.cx(_styles, "image-4")}
              loading="lazy"
              width="auto"
              height="33"
              alt="Youtube Logo"
              src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/6165793f68b1ea5ebe51bc2e_Icon%20awesome-youtube.svg"
            />
          </_Builtin.Link>
        </_Builtin.Container>
        <_Builtin.Block className={_utils.cx(_styles, "text-block-3")} tag="div">
          {"Made with 💚 for 🌎"}
        </_Builtin.Block>
      </_Builtin.Section>
    </_Component>
  );
}
