import requests

from GLOBAL_imp import FRED_INFO_URL, FRED_API_KEY, FRED_FREQUENCIES


class FREDTimeSeriesInfo:

    def __init__(self, name_abbr):
        self.time_series_name_abbr = name_abbr

        parameters = {
            'series_id': self.time_series_name_abbr,
            'api_key': FRED_API_KEY,
        }
        series_info = requests.get(FRED_INFO_URL, params=parameters).json()['seriess']

        self.observation_start = series_info['observation_start']
        self.observation_end = series_info['observation_end']
        self.min_freq = series_info['frequency_short']

    def get_available_freq(self):
        FRED_FREQUENCIES.index(self.min_freq)

    def get_dates(self):
        return self.observation_start, self.observation_end


