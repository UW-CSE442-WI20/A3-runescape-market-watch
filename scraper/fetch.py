import requests
import json
import time
import os.path
from os import path
import re
from datetime import datetime, timedelta
import logging


ITEMS_FILE = './items.json'
OUTPUT_FILE = './price_data.csv'
LOG_FILE = './logs/' + datetime.now().strftime("%d-%m-%y_%H:%M:%S")
BASE_URL = 'http://services.runescape.com/m=itemdb_oldschool/api/catalogue/items.json?'

def init():
    if (not path.exists(ITEMS_FILE)):
        print('[-] File ' + ITEMS_FILE + ' not found')
        os._exit(0)

    logging.basicConfig(filename=LOG_FILE, level=logging.INFO)
    logging.basicConfig(format='%(asctime)s %(message)s')

    print('[+] Located file ' + ITEMS_FILE)
    items = None
    with open(ITEMS_FILE) as items_file:
        items = json.load(items_file)

    print('[+] Fetching item data for {} items'.format(len(items)))
    for id in items:
        time.sleep(10)

        # fetch volume, average price, and daily closing price for
        # the last 180 days
        price_history = get_price_history(items[id], id)
        time.sleep(10)
        trade_volume = get_trade_volume(items[id], id)

        # normalize volume timestamps #####
        # THIS MAY NOT BE EXACTLY ACCURATELY MATCHING UP
        # VOLUME AND PRICE DATES - NEED 2 DOUBLE CHECK
        new_volume = {}
        volume_timestamps = trade_volume.keys()
        volume_timestamps.sort()
        new_timestamps = price_history['daily'].keys()
        new_timestamps.sort()

        for i in range(len(volume_timestamps)):
            new_volume[new_timestamps[i]] = trade_volume[volume_timestamps[i]]

        trade_volume = new_volume

        existing_output_file = path.exists(OUTPUT_FILE)
        with open(OUTPUT_FILE, 'a') as output:
            if not existing_output_file:
                output.write('timestamp, name, id, daily, average, vol\n')

            for ts in trade_volume.keys():
                vol = trade_volume[ts]
                average = price_history['average'][ts]
                daily = price_history['daily'][ts]
                output.write('{},{},{},{},{},{}\n'.format(
                    ts, items[id], id, daily, average, vol))

        logging.info(
            'Successfully fetched price data for {}:{}'.format(items[id], id))


def print_response(name, res):
    logging.info("Status: {} | {} | Length: {}".format(res.status_code, name, len(res.text)))

# Fetches daily and average price for the given item over the last 180 days
def get_price_history(name, id):
    url = 'http://services.runescape.com/m=itemdb_oldschool/api/graph/{}.json'.format(
        id)
    res = requests.get(url)
    #print_response(name, res)
    if res.status_code != 200:
        print('[-] Error fetching price data for item {}:{}, aborting'.format(name, id))
        print(res.content)
        os._exit(0)

    json_res = json.loads(res.text)
    result = {}
    result['daily'] = {}
    result['average'] = {}

    for ts in json_res['daily']:
        # Round date down to 00:00:00
        dt = datetime.fromtimestamp(float(ts) / 1000)
        dt = datetime(*dt.timetuple()[:3])
        rounded_ts = str(int(dt.strftime('%s'))*1000)

        result['daily'][rounded_ts] = json_res['daily'][ts]
        result['average'][rounded_ts] = json_res['average'][ts]

    return result

# Fetches  trade volume for the given item over the last 180 days


def get_trade_volume(name, id):
    url = 'http://services.runescape.com/m=itemdb_oldschool/{}/viewitem?obj={}'.format(
        name, id)
    res = requests.get(url)
    #print_response(name, res)

    if res.status_code != 200:
        logging.warning('Error fetching volume for {}:{}'.format(name, id))
        print(res.content)
        os._exit()

    volume = {}
    trade_data = re.findall(r'trade180.*;', res.text)
    trade_data = map(lambda x: x[24:-3].split('), '), trade_data)
    trade_data = trade_data[1:]

    for datum in trade_data:
        ts = datetime.strptime(datum[0][1:-1], '%Y/%m/%d')

        # Round date down to 00:00:00
        dt = datetime(*ts.timetuple()[:3])

        volume[str(int(dt.strftime('%s'))*1000)] = int(datum[1])

    return volume


def build_items_file():
    all_items = []
    final_doc = {}

    # Iterate A-Z (alpha represents starting char of item name)
    for alpha in range(97, 123):
        pg = 1
        url = BASE_URL + 'category=1&alpha={}'.format(chr(alpha))
        res = requests.get(url + '&page={}'.format(pg))
        print(url + '&page={}'.format(pg))
        time.sleep(5)

        # Wait 5 secs on every new letter
        json_res = json.loads(res.text)
        all_items.extend(json_res['items'])
        total = json_res['total']

        while(len(json_res['items']) != 0):
            time.sleep(5)
            pg += 1
            res = requests.get(url + '&page={}'.format(pg))
            print('{}/{}'.format(len(all_items), total))
            try:
                json_res = json.loads(res.text)
                all_items.extend(json_res['items'])
            except:
                print('[-] Error decoding JSON response, waiting 5s and trying again')
                time.sleep(5)
                pg -= 1

    for item in all_items:
        name = item['name'].replace(' ', '_')
        id = item['id']
        final_doc[id] = name

    with open(ITEMS_FILE, 'w+') as fd:
        json.dump(final_doc, fd, sort_keys=True, indent=4)


init()
