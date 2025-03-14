/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { Button, Checkbox, Input } from '@/components/inputs';
import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'

interface IConfig {
  column: string;
  isRender: boolean,
  name: string;
  default: string;
}

export default function SeedDataPage() {

  const [config, setConfig] = useState<IConfig[]>([]);
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [output, setOutput] = useState("")
  const [nameTable, setNameTable] = useState("");
  const onChange = (file: File | undefined) => {
    if (!file) return

    const reader = new FileReader();

    reader.onload = function(e) {
      const data = new Uint8Array((e as any).target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(sheet);
      setData(jsonData as unknown as any);
    };
    reader.readAsArrayBuffer(file);
  }


  const onChecked = (index: number) => {
    const _config = [...config]
    _config[index].isRender = !_config[index].isRender
    setConfig(_config)
  }

  const onChangeInput = (index: number, value: string) => {
    const _config = [...config]
    _config[index].name = value
    setConfig(_config)
  }

  const onChangeDefault = (index: number, value: string) => {
    const _config = [...config]
    _config[index].default = value
    setConfig(_config)
  }



  const renderValue = (defaultValue: string, value?: string | number) => {
    return value && value !== 'NULL' ? `'${value}'` : defaultValue.length > 0 ? defaultValue : "NULL"
  }

  const renderOutOut = () => {
    const _config = config.filter(item => item.isRender);
    let _query = `INSERT INTO "${nameTable}" (\n\t${_config.map(item => item.name).join(", \n\t")}\n)\n`;
    _query += "VALUES\n"
    data.forEach((item, index) => {
      _query += `(\n\t${_config.map(_c => renderValue(_c.default, item[_c.column]),).join(", \n\t")}\n)`
      if (index < data.length - 1) {
        _query += `,\n`
      }
    })
    setOutput(_query)
  }

  const onCopy = async () => {
    await navigator.clipboard.writeText(output)
  }

  useEffect(() => {
    if (data && data.length > 0) {
      const first = data[0];
      const _config: IConfig[] = [];
      Object.keys(first).forEach(item => {
        _config.push({
          column: item,
          name: item.toLowerCase().split(" ").join("_"),
          isRender: true,
          default: ''
        })
      })
      setConfig(_config)
    } else {
      setConfig([])
    }
  }, [data])

  useEffect(() => {
    renderOutOut()
  }, [nameTable, config, data])

  return (
    <div className='flex w-full gap-5'>
      <div className='w-full'>
        <div className='flex w-full'>
          <Input label='Name table' classcontainer='w-full' value={nameTable} onChange={e => setNameTable(e.target.value)} />
          <input className='self-end' type="file" accept="*" onChange={e => onChange(e.target.files?.[0])} />
        </div>
        {
          config.map((item, index) => {
            return (
              <div key={item.name + index} className='flex w-full gap-2 mt-2'>
                <div className='flex w-full gap-2'>
                  <Checkbox classcontainer='self-end mb-2' checked={item.isRender} onChange={() => onChecked(index)} />
                  <Input value={item.name} label={item.column} onChange={(e) => onChangeInput(index, e.target.value)} />
                </div>
                <div className='w-full'>
                  <Input value={item.default} label={"Default"} onChange={(e) => { onChangeDefault(index, e.target.value) }} />
                </div>
              </div>)
          })
        }
      </div>
      <div className='w-full'>
        <div className='flex justify-between mb-2'>
          <label>Output</label>
          <div className='flex gap-2'>
            <Button label='Reset' onClick={renderOutOut} />
            <Button label='Copy' onClick={onCopy} />
          </div>
        </div>
        <textarea className='w-full h-full' value={output} onChange={e => setOutput(e.target.value)} />
      </div>
    </div >
  )
}
