"use client";

import * as React from "react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AccentColorPicker, createAccentStyle } from "@/components/AccentColorPicker";
import { Chart } from "@/components/Chart";
import { ForbiddenPage } from "@/components/documentation/ForbiddenPage";
import { NotFoundPage } from "@/components/documentation/NotFoundPage";
import { IconPicker } from "@/components/IconPicker";
import * as Fields from "@/components/fields";
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
    Chart,
    AccentColorPicker,
    createAccentStyle,
    IconPicker,
    ForbiddenPage,
    NotFoundPage,
    FontAwesomeIcon,
    demoUpcomingTasks,
    demoRecentActivity,
    demoTopPerformingUsers,
    demoNotesActivity,
    topNavigationDemoMenus,
    ...Fields,
  };
}

export type PlaygroundScope = ReturnType<typeof createPlaygroundScope>;
