"use client"

import { useState } from "react"
import { Button, DatePicker, Input } from "@/components/inputs"

interface IDate {
  date?: string,
  timeSpent?: string;
}

interface IData {
  cookies: string;
  ticketId: string;
  dates: IDate[];
}

const initData: IData = {
  cookies: "",
  ticketId: "",
  dates: []
}


export default function LogWorkPage() {

  const [data, setData] = useState(initData);

  const onChangeDate = (index: number, value: string) => {
    const _data = { ...data }
    const { dates } = _data;
    dates[index].date = value
    setData(_data);
  }

  const onBlurDate = (index: number, value?: string) => {
    const _data = { ...data }
    const { dates } = _data;
    if (index === 0) {
      dates.filter(item => !item.date).forEach(item => {
        item.date = value
      })
    }
    setData(_data);

  }

  const onChangeHour = (index: number, value: string) => {
    const _data = { ...data };
    const { dates } = _data;
    dates[index].timeSpent = value;
    setData(_data)
  }

  const onBlurHour = (index: number, value?: string) => {
    const _data = { ...data };
    const { dates } = _data;
    if (index === 0) {
      dates.filter(item => !item.timeSpent).forEach(item => {
        item.timeSpent = value
      })
    }
    setData(_data);
  }

  const onAddDate = () => {
    const _data = { ...data };
    const { dates } = _data;
    dates.push(initDate())
    setData(_data)
  }

  const onRemoveDate = (index: number) => {
    const _data = { ...data };
    _data.dates = _data.dates.filter((_, _index) => _index !== index)
    setData(_data);
  }


  const initDate = (): IDate => {
    return {
      timeSpent: "",
      date: "",
    }
  }

  const handleSubmit = async () => {
    try {
      const url = "http://localhost:3000/jira/log-work";
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      alert("Log work successfully!")
    } catch (error) {
      alert("Log work failed!")
    }
  }

  return (
    <div>
      <Input label="Token" value={data.cookies} onChange={e => setData({ ...data, cookies: e.target.value })} />
      <Input label="Ticket ID" value={data.ticketId} onChange={(e) => setData({ ...data, ticketId: e.target.value })} />
      {
        data.dates.map((item, index) => {
          const _label = `Date ${index + 1}`
          return (
            <div className="flex gap-2" key={`${JSON.stringify(item)}-${index}`}>
              <DatePicker
                label={_label}
                value={item.date}
                onChange={e => onChangeDate(index, e.target.value)}
                onBlur={() => onBlurDate(index, item.date)}
              />
              <Input
                type="number"
                value={item.timeSpent?.toString()}
                label="Time"
                onChange={e => onChangeHour(index, e.target.value)}
                onBlur={() => onBlurHour(index, item.timeSpent)}
              />
              <Button label="Remove" onClick={() => onRemoveDate(index)} />
            </div>
          )
        })
      }
      <Button label="Add" onClick={() => onAddDate()} />
      <Button label="Submit" onClick={handleSubmit} />
    </div>
  )
}




