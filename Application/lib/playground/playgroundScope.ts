"use client";

import * as React from "react";
import * as THREE from "three";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ErrorPage } from "@/components/documentation/ErrorPage";
import { ForbiddenPage, ForbiddenPageContent } from "@/components/documentation/ForbiddenPage";
import { NotFoundPage, NotFoundPageContent } from "@/components/documentation/NotFoundPage";
import { Map } from "@/components/Map";
import { ContactDetails, ContactNotesActivity } from "@/components/ContactDetails";
import * as Fields from "opus-react";
import { demoNotesActivity } from "@/lib/controls/notesActivityDemoData";
import { demoRecentActivity } from "@/lib/controls/recentActivityDemoData";
import { demoTopPerformingUsers } from "@/lib/controls/topPerformingUsersDemoData";
import { demoUpcomingTasks } from "@/lib/controls/upcomingTasksDemoData";
import { topNavigationDemoMenus } from "@/lib/controls/topNavigationDemo";

export function createPlaygroundScope() {
  return {
    React,
    useState,
    useMemo,
    useCallback,
    useEffect,
    useRef,
    useId,
    THREE,
    three: THREE,
    ErrorPage,
    ForbiddenPage,
    ForbiddenPageContent,
    NotFoundPage,
    NotFoundPageContent,
    FontAwesomeIcon,
    demoUpcomingTasks,
    demoRecentActivity,
    demoTopPerformingUsers,
    demoNotesActivity,
    topNavigationDemoMenus,
    ...Fields,
    ContactDetails,
    ContactNotesActivity,
    Map,
  };
}

export type PlaygroundScope = ReturnType<typeof createPlaygroundScope>;
