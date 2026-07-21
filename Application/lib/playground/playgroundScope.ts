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
import { VideoPlayer } from "@/components/VideoPlayer";
import { AudioPlayer } from "@/components/AudioPlayer";
import * as Fields from "opus-react";
import { demoNotesActivity } from "@/lib/controls/notesActivityDemoData";
import { demoRecentActivity } from "@/lib/controls/recentActivityDemoData";
import { demoTopPerformingUsers } from "@/lib/controls/topPerformingUsersDemoData";
import { demoUpcomingTasks } from "@/lib/controls/upcomingTasksDemoData";
import { topNavigationDemoMenus } from "@/lib/controls/topNavigationDemo";
import { demoAudioTracks } from "@/lib/controls/audioDemoData";
import { demoVideoTracks } from "@/lib/controls/videoDemoData";

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
    demoAudioTracks,
    demoVideoTracks,
    topNavigationDemoMenus,
    ...Fields,
    ContactDetails,
    ContactNotesActivity,
    Map,
    VideoPlayer,
    AudioPlayer,
  };
}

export type PlaygroundScope = ReturnType<typeof createPlaygroundScope>;
