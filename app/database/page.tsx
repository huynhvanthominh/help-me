/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useState } from "react"
import * as XLSX from 'xlsx'
interface IRow {
  "Entity name": string,
  "Technical name": string,
  "Length": number,
  "Not null": boolean,
  "Primary key": boolean,
  "Type": string,
  "Subtype": string,
  "Unique": boolean,
  nameInCode: string
}
export default function DatabasePage() {
  const [output1, setOutput1] = useState("");
  const [output2, setOutput2] = useState("");
  const [output3, setOutput3] = useState("");

  const onChange = (file: File | undefined) => {
    if (!file) return

    const reader = new FileReader();

    reader.onload = function(e) {
      const data = new Uint8Array((e as any).target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(sheet);
      handleValue(mapData(jsonData as IRow[]))
    };
    reader.readAsArrayBuffer(file);
  }

  const mapTypeOrm = (type: string, subType?: string): string => {
    if (type === "json") return "jsonb"
    if (type == "timestamp") return "timestamptz"
    return subType ?? type
  }

  const mapTypeJS = (type: string, subType?: string): string => {
    const _type = mapTypeOrm(type, subType);
    if (_type == "timestamptz") return "Date"
    else return "string"
  }

  const mapData = (json: IRow[]): IRow[] => {
    return json.filter(item => !["create_user_id", "create_program_id", "create_date", "update_user_id", "update_program_id", "update_date", "edw_update_date"].includes(item["Technical name"])).map(item => {
      const nameInCode = item["Technical name"].split("_").map((char, index) => {
        if (index === 0) return char;
        return char.charAt(0).toUpperCase() + char.slice(1)
      }).join("")
      return {
        ...item,
        nameInCode
      }
    }) as any
  }

  const handleOutput1 = (nameConst: string, name: string, data: IRow[]) => {
    let rs1 = `export const ${nameConst}= {\n\tname: "${name}",\n\tcolumn: {\n`;
    data.forEach(item => {
      const _name = item["Technical name"]
      rs1 += `\t\t${item.nameInCode}: "${_name}",\n`
    })
    rs1 += `\t},\n};\n`;
    setOutput1(rs1)
  }

  const handleOutput2 = (nameConst: string, name: string, data: IRow[]) => {
    let rs = `@Entity(${nameConst}.name)\n`;
    const uniques = data.filter(item => item.Unique == true);
    if (uniques.length > 0) {
      rs += `@Unique([${uniques.map(item => `"${item.nameInCode}"`).join(",")}])`
    }
    const nameClass = name.split("_").slice(1).map(item => item.charAt(0).toUpperCase() + item.slice(1)).join("")
    rs += `\nexport class ${nameClass}Entity{\n`;
    data.forEach(item => {
      const _name = item.nameInCode
      const p = item["Primary key"];
      if (p) {
        rs += `\t@PrimaryColumn({\n`
      } else {
        rs += `\t@Column({\n`
      }
      const _type = mapTypeOrm(item.Type, item.Subtype)
      rs += `\t\ttype: '${_type}',\n`
      if (_type === "uuid") {
        rs += `\t\tgenerated: 'uuid',\n`
      }
      if (item.Length) {
        rs += `\t\tlength: ${item.Length},\n`
      }
      if (!item["Not null"]) {
        rs += `\t\tnullable: ${!item["Not null"]},\n`
      }
      rs += `\t\tname: ${nameConst}.column.${_name},\n`
      rs += `\t})\n`
      rs += `\t${_name}: ${mapTypeJS(item.Type, item.Subtype)};\n\n`
    })
    rs += "};\n"
    setOutput2(rs)
  }

  const handleOutput3 = (nameConst: string, data: IRow[]) => {
    let rs = `table: ITable = {\n`
    rs += `\tname: ${nameConst}.name,\n`
    const p = data.filter(item => item["Primary key"]).map(item => `"${item["Technical name"]}"`)
    rs += `\tprimaryKeys: [${p.join(",")}],\n`
    const u = data.filter(item => item.Unique).map(item => `"${item["Technical name"]}"`)
    rs += `\tuniques: [${u.join(",")}],\n`
    rs += `\tcols: [\n`
    data.forEach(item => {
      rs += `\t\t{\n`
      rs += `\t\t\tname: ${nameConst}.column.${item.nameInCode},\n`
      const _type = mapTypeOrm(item.Type, item.Subtype)
      rs += `\t\t\ttype: "${_type}",\n`;
      if (_type === "uuid") {
        rs += `\t\t\tdefault: "gen_random_uuid()",\n`;
      }
      if (!item["Not null"]) {
        rs += `\t\t\tnullAble: ${!item["Not null"]},\n`
      }
      if (item.Length) {
        rs += `\t\t\tlength: ${item.Length},\n`
      }
      rs += `\t\t},\n`
    })
    rs += `\t]\n`;
    rs += `}\n`
    setOutput3(rs)
  }

  const handleValue = (data: IRow[]) => {
    if (data.length === 0) return;
    const first = data[0];
    const name = first["Entity name"].toLowerCase().split(" ").join("_");
    const nameConst = first["Entity name"].split(" ").map((char, index) => {
      if (index === 0) return char.toLowerCase()
      return char.charAt(0).toUpperCase() + char.slice(1)
    }).join("") + "Table"
    handleOutput1(nameConst, name, data)
    handleOutput2(nameConst, name, data)
    handleOutput3(nameConst, data)
  }

  const onCopy = async (num: number) => {
    const val = num === 1 ? output1 : num === 2 ? output2 : output3
    await navigator.clipboard.writeText(val)
    alert("Copied!")
  }
  return (
    <div className="">
      <div>Input</div>
      <input type="file" accept="*" onChange={e => onChange(e.target.files?.[0])} />
      <div className="flex justify-between">
        <div>Output 1</div>
        <button onClick={() => onCopy(1)} className="cursor-pointer">Copy</button>
      </div>
      <textarea rows={10} value={output1} readOnly className="w-full" />
      <div className="flex justify-between">
        <div>Output 2</div>
        <button onClick={() => onCopy(2)} className="cursor-pointer">Copy</button>
      </div>
      <textarea rows={30} value={output2} readOnly className="w-full" />
      <div className="flex justify-between">
        <div>Output 3</div>
        <button onClick={() => onCopy(3)} className="cursor-pointer">Copy</button>
      </div>
      <textarea rows={30} value={output3} readOnly className="w-full" />
    </div>
  )
}
