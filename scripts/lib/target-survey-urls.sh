#!/usr/bin/env bash

read_target_survey_field() {
  node --import tsx src/cli/read-target-survey-field.ts "$@"
}

load_target_survey_urls() {
  local target_name="$1"
  local survey_name="$2"
  local prefix="${3:-TARGET_SURVEY}"

  printf -v "${prefix}_PORT" '%s' "$(read_target_survey_field "${target_name}" "${survey_name}" port)"
  printf -v "${prefix}_PUBLIC_URL" '%s' "$(read_target_survey_field "${target_name}" "${survey_name}" publicUrl)"
  printf -v "${prefix}_SAVE_URL" '%s' "$(read_target_survey_field "${target_name}" "${survey_name}" saveUrl)"
  printf -v "${prefix}_REPORT_URL" '%s' "$(read_target_survey_field "${target_name}" "${survey_name}" reportUrl)"
}
