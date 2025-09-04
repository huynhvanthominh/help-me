/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useEffect, useState } from "react"
import * as XLSX from 'xlsx'
import { mapTypeProto } from "./ultils";
import { TYPE_DATABASE_ENUM } from "./enums/type.enum";
interface IRow {
  "Entity name": string,
  "Technical name": string,
  "Length": number,
  "Not null": boolean,
  "Primary key": boolean,
  "Type": TYPE_DATABASE_ENUM,
  "Subtype": string,
  "Unique": boolean,
  "Default": string,
  "Business Name": string,
  nameInCode: string
}
export default function DatabasePage() {
  const [data, setData] = useState<IData>();
  const [output1, setOutput1] = useState("");
  const [output2, setOutput2] = useState("");
  const [output3, setOutput3] = useState("");
  const [output4, setOutput4] = useState("");
  const [output5, setOutput5] = useState("");
  const [output6, setOutput6] = useState("");
  const [output7, setOutput7] = useState("");
  const [sheetNumber, setSheetNumber] = useState(0);
  const [file, setFile] = useState<File | undefined>();
  const nameFile = data?.data?.[0]?.["Entity name"].replace("trm ", "").replaceAll(" ", "-")
  const interfacePath = `src/domain/shared/interfaces/entities/${nameFile}.entity.interface.ts`
  const entityPath = `src/infrastructure/databases/entities/${nameFile}.entity.ts`
  const protoPath = `proto/chorus/trm/${nameFile?.replaceAll("-", "_")}/v1/${nameFile?.replaceAll("-", "_")}.proto`
  interface IData {
    data: IRow[]
    full: IRow[]
  }

  const onChange = (file: File | undefined) => {
    if (!file) return
    setFile(file)
    const reader = new FileReader();

    reader.onload = function(e) {
      const data = new Uint8Array((e as any).target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      const sheetName = workbook.SheetNames[sheetNumber];
      const sheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(sheet);
      setData(mapData(jsonData as IRow[]))
    };
    reader.readAsArrayBuffer(file);
  }

  const mapTypeOrm = (type: string, subType?: string): string => {
    if (type === "json") return "jsonb"
    if (type == "timestamp" || type === "datetime") return "timestamptz"
    return subType ?? type
  }

  const mapTypeJS = (type: string, subType: string, notNull: boolean): string => {
    const _type = mapTypeOrm(type, subType);
    let rs = ''
    if (_type == "timestamptz") rs = "Date"
    else if (_type === "numeric") rs = "number"
    else if (_type === 'boolean') rs = 'boolean'
    else rs = "string"
    if (!notNull) {
      rs += " | null"
    }
    return rs;
  }

  const mapData = (json: IRow[]): IData => {
    return {
      data: json.filter(item => !["create_user_id", "create_program_id", "create_date", "update_user_id", "update_program_id", "update_date", "edw_update_date"].includes(item["Technical name"])).map(item => {
        const nameInCode = item["Technical name"].split("_").map((char, index) => {
          if (index === 0) return char;
          return char.charAt(0).toUpperCase() + char.slice(1)
        }).join("")
        return {
          ...item,
          nameInCode
        }
      }) as any,
      full: json.map(item => {
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
  }

  const getNameClass = (name: string) => {
    return name.split("_").slice(1).map(item => item.charAt(0).toUpperCase() + item.slice(1)).join("")
  }

  const handleOutput1 = (nameConst: string, name: string, data: IRow[]) => {
    let rs1 = `import { IBaseEntity } from "./base.entity.interface";\n\n`
    rs1 += `export interface I${getNameClass(name)}Entity extends IBaseEntity {\n`
    data.forEach(item => {
      const notNull = item["Not null"]
      rs1 += `\t\t${item.nameInCode}: ${mapTypeJS(item.Type, item.Subtype, notNull)},\n`
    })
    rs1 += '}\n'
    setOutput1(rs1)
  }

  const handleOutput7 = (nameConst: string, name: string, data: IRow[]) => {
    let rs1 = `export const ${nameConst}= {\n\tname: "${name}",\n\tcolumn: {\n`;
    data.forEach(item => {
      const _name = item["Technical name"]
      rs1 += `\t\t${item.nameInCode}: "${_name}",\n`
    })
    rs1 += `\t},\n};\n`;
    setOutput7(rs1)
  }



  const handleOutput2 = (nameConst: string, name: string, data: IRow[]) => {
    let rs = `@Entity(${nameConst}.name)\n`;
    const uniques = data.filter(item => item.Unique == true);
    if (uniques.length > 0) {
      rs += `@Unique([${uniques.map(item => `"${item.nameInCode}"`).join(",")}])`
    }
    const nameClass = getNameClass(name);
    rs += `\nexport class ${nameClass}Entity extends BaseEntity implements I${nameClass}Entity{\n`;
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
      if (item.Length && !['numeric', 'boolean'].includes(_type)) {
        rs += `\t\tlength: ${item.Length},\n`
      }
      const notNull = item["Not null"]
      if (!notNull) {
        rs += `\t\tnullable: ${!notNull},\n`
      }
      rs += `\t\tname: ${nameConst}.column.${_name},\n`
      rs += `\t})\n`
      rs += `\t${_name}: ${mapTypeJS(item.Type, item.Subtype, notNull)};\n\n`
    })
    rs += `\tconstructor() {\n`
    rs += `\t\tsuper();\n`
    data.filter(item => !item["Not null"]).forEach(item => {
      rs += `\t\tthis.${item.nameInCode} = null;\n`;
    })
    rs += `\t}\n`

    rs += "};\n"
    setOutput2(rs)
  }

  const handleOutput3 = (nameConst: string, data: IRow[]) => {
    let rs = `const table: ITable = {\n`
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
      if (item.Length && !['numeric', 'boolean'].includes(_type)) {
        rs += `\t\t\tlength: ${item.Length},\n`
      }
      rs += `\t\t},\n`
    })
    rs += `\t]\n`;
    rs += `}\n`
    setOutput3(rs)
  }

  const _renderType = ({ Type, Subtype, Length, ...item }: IRow) => {
    const _type = (Subtype ?? Type).toUpperCase();

    let _data = `${_type}(${Length})`;
    if (_type === 'timestamp'.toUpperCase()) {
      _data = 'timestamptz'.toUpperCase()
    } else if (_type === 'BOOLEAN') {
      _data = `BOOLEAN`
    } else if (_type === 'NUMERIC') {
      _data = 'NUMERIC'
    }

    if (item["Not null"]) {
      _data += ' NOT NULL'
    }
    if (item.Default !== undefined) {
      _data += ` DEFAULT ${item.Default.toString().toUpperCase()}`
    }
    return _data
  }
  const handleOutput4 = (name: string, data: IRow[]) => {
    let _query = `CREATE TABLE "${name}" (\n`;
    data.forEach((item: IRow, index: number) => {
      _query += `\t${item["Technical name"]} ${_renderType(item)}`
      if (index < data.length - 1) {
        _query += ",\n"
      } else {
        _query += '\n'
      }
    })
    _query += ")"
    setOutput4(_query)
  }

  const handleOutput5 = (name: string) => {
    const _query = `DROP TABLE IF EXISTS "${name}"`
    setOutput5(_query)
  }

  const handleOutput6 = (name: string, full: IRow[]) => {
    let rs = 'syntax = "proto3";\n\n';
    rs += `package chorus.trm.${name.replace("trm_", "")}.v1;\n\n`
    const _name = full[0]?.["Entity name"];
    if (_name) {
      rs += `// The ${_name} information\n`
    }
    rs += `message ${getNameClass(name)} {\n`
    full.forEach((item, index) => {
      rs += `\t// The ${item["Technical name"]} is ${item["Business Name"]}\n`
      rs += '\t'
      if (!item["Not null"]) {
        rs += `optional `;
      }
      rs += `${mapTypeProto(item.Type)} ${item["Technical name"]} = ${index + 1};\n`
    });
    rs += '}\n'

    setOutput6(rs);
  }

  const handleValue = ({ data, full }: {
    data: IRow[],
    full: IRow[]
  }) => {
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
    handleOutput4(name, full);
    handleOutput5(name);
    handleOutput6(name, full);
    handleOutput7(nameConst, name, data)
  }

  const onCopy = async (value: string) => {
    await navigator.clipboard.writeText(value)
  }

  useEffect(() => {
    if (data) {
      handleValue(data)
    }
  }, [data])

  return (
    <div className="">
      <div>Input</div>
      <input type="file" accept="*" onChange={e => onChange(e.target.files?.[0])} />
      <input type="number" value={sheetNumber} onChange={e => setSheetNumber(Number(e.target.value))} />
      <button onClick={() => onChange(file)} className="cursor-pointer">Reset</button>
      <div className="flex gap-1">
        <div className="w-1/2">
          <div className="flex justify-between">
            <div>
              <span>Interface + Define Constant Entity: {interfacePath}</span>
              <button onClick={() => onCopy(interfacePath)} className="cursor-pointer">Copy</button>
            </div>
            <button onClick={() => onCopy(output1)} className="cursor-pointer">Copy</button>
          </div>
          <textarea rows={10} value={output1} readOnly className="w-full" />

          <div className="flex justify-between">
            <div className="gap-5">
              <span>Entity: {entityPath}</span>
              <button onClick={() => onCopy(entityPath)} className="cursor-pointer">Copy</button>
            </div>
            <button onClick={() => onCopy(output2)} className="cursor-pointer">Copy</button>
          </div>
          <textarea rows={30} value={output2} readOnly className="w-full" />

          <div className="flex justify-between">
            <div>
              <span>Proto: {protoPath}</span>
              <button onClick={() => onCopy(protoPath)} className="cursor-pointer">Copy</button>
            </div>
            <button onClick={() => onCopy(output6)} className="cursor-pointer">Copy</button>
          </div>
          <textarea rows={30} value={output6} readOnly className="w-full" />


        </div>
        <div className="w-1/2">

          <div className="flex justify-between">
            <div>Constant Table</div>
            <button onClick={() => onCopy(output7)} className="cursor-pointer">Copy</button>
          </div>
          <textarea rows={30} value={output7} readOnly className="w-full" />


          <div className="flex justify-between">
            <div>Migration 1</div>
            <button onClick={() => onCopy(output3)} className="cursor-pointer">Copy</button>
          </div>
          <textarea rows={30} value={output3} readOnly className="w-full" />


          {/*
          <div className="flex justify-between">
            <div>Migration 2</div>
            <button onClick={() => onCopy(output4)} className="cursor-pointer">Copy</button>
          </div>
          <textarea rows={30} value={output4} readOnly className="w-full" />

          <div className="flex justify-between">
            <div>Migration 3</div>
            <button onClick={() => onCopy(output5)} className="cursor-pointer">Copy</button>
          </div>
          <textarea rows={30} value={output5} readOnly className="w-full" />
*/}
        </div>
      </div>
      <div className="">
      </div>
    </div>
  )
}
