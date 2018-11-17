import RPi.GPIO as GPIO
import datetime as dt
import time
from sqlalchemy import create_engine
from config import con_string


class Schedule:
    def __init__(self):
        self.days = {
            0: 'Monday',
            1: 'Tuesday',
            2: 'Wednesday',
            3: 'Thursday',
            4: 'Friday',
            5: 'Saturday',
            6: 'Sunday'
        }
        self.start_time = dt.datetime.now()
        self.con = create_engine(con_string, pool_recycle=3600).connect()
        self.run = False
        self.day_of_week = self.start_time.weekday()
        self.program = 'None'
        self.get_program_times()
        self.sprinklers = {
            'bush': 17,
            'front_yard': 27,
            'back_left': 22,
            'back_right': 18
        }

    def logger(self, func, msg):
        now = dt.datetime.now()
        sql = """insert into sprinklers.logger (run_time, func, meta)
        values('{0}', '{1}', '{2}')""".format(now, func, msg)
        self.con.execute(sql)

    def check_days(self):
        if self.program == 'None':
            return False

        day = self.days[self.day_of_week]
        sql = '''
            SELECT
                run
            FROM
                sprinklers.run_days
            WHERE
                program = '{program}'
                AND day = '{day}'
            '''.format(day=day, program=self.program)
        run = self.con.execute(sql).fetchone()[0]
        return run == 1

    def check_rain(self):
        sql = "select rain from sprinklers.rain"
        rain = self.con.execute(sql).fetchone()[0]
        if rain == 1:
            self.logger('check_rain', 'failed rain check')
        return rain == 0

    def get_program_times(self):
        sql = "select program, start_time from sprinklers.start_times"
        today = dt.date.today().strftime('%Y%m%d')
        rows = self.con.execute(sql)

        for row in rows:
            delta = (self.start_time - dt.datetime.strptime(today + row[1], '%Y%m%d%H:%M')).seconds
            if delta < 10 and delta >= 0 and self.check_rain():
                self.program = row[0]
                if self.check_days():
                    self.run = True
                    self.logger('get_program_times', 'past all checks')

    def check_run(self):
        sql = "select is_running from sprinklers.running_flag"
        row = self.con.execute(sql).fetchone()
        return row[0]

    def set_run(self, run):
        sql = "update sprinklers.running_flag set is_running = {0}".format(run)
        self.con.execute(sql)

    def run_program(self):
        sql = """
            SELECT
                sprinkler_group,
                duration,
                position
            FROM
                sprinklers.programs
            WHERE
                program = '{0}'
            ORDER BY 3""".format(self.program)
        rows = self.con.execute(sql)
        duration = {}
        for row in rows:
            duration[row[0]] = {
                'pin': self.sprinklers[row[0]],
                'time': row[1]
            }

        GPIO.setmode(GPIO.BCM)
        for _k, v in duration.items():
            if self.check_run() == 0:
                GPIO.setup(v['pin'], GPIO.OUT)
                #turn on
                self.logger('run_program', 'turning on pin {0}'.format(v['pin']))
                GPIO.output(v['pin'], GPIO.LOW)
                self.set_run(1)
                time.sleep(v['time'] * 60)
                GPIO.output(v['pin'], GPIO.HIGH)
                self.logger('run_program', 'turning off pin {0}'.format(v['pin']))
                self.set_run(0)

schedule = Schedule()
if schedule.run:
    schedule.run_program()
