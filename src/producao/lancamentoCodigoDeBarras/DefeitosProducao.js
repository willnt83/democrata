import React, { Component } from 'react'
import { Row, Col, Form, Modal, Select, Icon, Button, Divider, Table, InputNumber, Tag, Popconfirm } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"
import { withRouter } from "react-router-dom"
import BarcodeReader from 'react-barcode-reader'

const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends Component {
    state = {
        editing: false,
    };

    toggleEdit = () => {
        const editing = !this.state.editing;
        this.setState({ editing }, () => {
        if (editing) {
            this.input.focus();
        }
        });
    };

    save = e => {
        const { record, handleSave } = this.props;
        this.form.validateFields((error, values) => {
            if (error && error[e.currentTarget.id]) {
                return;
            }
            this.toggleEdit();
            handleSave({ ...record, ...values });
        });
    };

    renderCell = form => {
        this.form = form;
        const { children, dataIndex, record, errorMessage } = this.props;
        const { editing } = this.state;
        return editing ? (
        <Form.Item style={{ margin: 0 }}>
            {form.getFieldDecorator(dataIndex, {
            rules: [
                {
                required: true,
                message: errorMessage,
                },
            ],
            initialValue: record[dataIndex],
            })(<InputNumber 
                    ref={node => (this.input = node)} 
                    onPressEnter={this.save} 
                    onBlur={this.save} 
                    min={0} 
                    max={9999999}
                />)}
        </Form.Item>
        ) : (
        <div
            style={{ paddingRight: 24 }}
            onClick={this.toggleEdit}
        >
            {children}
        </div>
        );
    };

    render() {
        const {
        editable,
        dataIndex,
        title,
        errorMessage,
        record,
        index,
        handleSave,
        children,
        ...restProps
        } = this.props;
        return (
        <td {...restProps}>
            {editable ? (
            <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>
            ) : (
            children
            )}
        </td>
        );
    }
}

class DefeitosProducao extends Component{
    constructor(props){
        super(props)

        this.columns = [{
            title: 'ID',
            dataIndex: 'id',
            sorter: (a, b) => a.key - b.key,
        },
        {
            title: 'Produção',
            dataIndex: 'producao.nome',
            sorter: (a, b) => this.compareByAlph(a.producao.nome, b.producao.nome)
        },
        {
            title: 'Produto',
            dataIndex: 'produto.nome',
            sorter: (a, b) => this.compareByAlph(a.produto.nome, b.produto.nome)
        },
        {
            title: 'Cor',
            dataIndex: 'produto.cor',
            sorter: (a, b) => this.compareByAlph(a.produto.cor, b.produto.cor)
        },
        {
            title: 'Conjunto',
            dataIndex: 'conjunto.nome',
            sorter: (a, b) => this.compareByAlph(a.conjunto.nome, b.conjunto.nome)
        },
        {
            title: 'Setor',
            dataIndex: 'setor.nome',
            sorter: (a, b) => this.compareByAlph(a.setor.nome, b.setor.nome)
        },
        {
            title: 'Subproduto',
            dataIndex: 'subproduto.nome',
            sorter: (a, b) => this.compareByAlph(a.subproduto.nome, b.subproduto.nome)
        },
        {
            title: 'Funcionário',
            dataIndex: 'funcionario.nome',
            sorter: (a, b) => this.compareByAlph(a.funcionario.nome, b.funcionario.nome)
        },
        {
            title: 'Quantidade',
            dataIndex: 'quantidade',
            errorMessage: 'Quantidade é obrigatória.',
            editable: true,
            sorter: (a, b) => this.compareByAlph(a.quantidade, b.quantidade)
        },
        {
            title: 'Operacao',
            dataIndex: 'operacao',
            render: (text, record) =>
            this.state.tableData.length >= 1 ? (
                <Popconfirm title="Tem certeza que deseja remover o código de barras do lançamento?" onConfirm={() => this.handleDelete(record.id)}>
                    <Tag color="volcano" style={{cursor: 'pointer'}}>x Remover</Tag>
                </Popconfirm>
            ) : null,
        }]

        this.state = {
            mostrar: false,
            producoesOptions: [],
            setoresOptions: [],
            subprodutosOptions: [],
            idProducao: null,
            idSetor: null,
            idSubproduto: null,
            nomeProducao: null,
            tableData: [],
            tableKeys: [],
            barcodeReader: false
        }
        this.handleScanConferencia = this.handleScanConferencia.bind(this)
    }

    handleScanConferencia(data){
        if(this.state.idFuncionario !== null){
            this.requestGetCodigoDeBarra(data)
        }
        else{
            this.props.showNotification('Selecione uma produção', false)
        }
    }

    handleError(err){
        console.error(err)
    }

    requestGetProducoesTitulo = () => {
        axios
        .get(this.props.backEndPoint + '/getProducoesTitulo')
        .then(res => {
            this.setState({
                producoesOptions: res.data.payload.map(producao => {
                    return({
                        value: producao.id,
                        description: producao.id+' - '+producao.nome
                    })
                })
            })
        })
        .catch(error => {
            console.log(error)
        })
    }

    requestGetSetoresTitulo = () => {
        axios
        .get(this.props.backEndPoint + '/getSetoresTitulo')
        .then(res => {
            this.setState({
                setoresOptions: res.data.payload.map(setor => {
                    return({
                        value: setor.id,
                        description: setor.id+' - '+setor.nome
                    })
                })
            })
        })
        .catch(error => {
            console.log(error)
        })
    }

    requestGetCodigoDeBarra = (barcode) => {
        axios
        .get(this.props.backEndPoint    + '/getCodigoDeBarra?idProducao='+this.state.idProducao
                                        + '&idSetor='+this.state.idSetor
                                        + '&idSubproduto='+ this.state.idSubproduto
                                        + '&barcode='+barcode )
        .then(res => {
            if(res.data.success){
                let barcodeData = res.data.payload
                let tableData   = this.state.tableData
                let tableKeys   = this.state.tableKeys
                if(barcodeData) {
                    // if(barcodeData.codigoDeBarras.lancaco !== 'S'){
                    //     this.props.showNotification('Código de Barras ainda não lançado.', false)
                    // } else {
                        if(tableKeys.indexOf(barcodeData.id) === -1) {
                            // Adding data
                            barcodeData.quantidade = 1
                            tableData.push(barcodeData)
                            tableKeys.push(barcodeData.id)
                            this.setState({tableData, tableKeys})
                        } else {
                            this.props.showNotification('Código de Barras já inserido.', false)
                        }
                    // }
                } else {
                    this.props.showNotification('Código de Barras incorreto para a produção escolhida.', false)
                }
            } else {
                this.props.showNotification(res.data.msg, false)
            }
        })
        .catch(error => {
            console.log(error)
        })
    }

    requestDefeitosProducao = (request) => {
        axios
        .post(this.props.backEndPoint + '/defeitoCodigoDeBarras', request)
        .then(res => {
            if(res.data.success){
                this.props.showNotification(res.data.msg, res.data.success)
                this.closeModal()
            }
            else{
                this.props.showNotification(res.data.msg, res.data.success)
            }
        })
        .catch(error => {
            console.log(error)
        })
    }

    producaoChange = (value, e) => {
        this.setState({
            idProducao: value,
            nomeProducao: e.props.children
        })
    }

    setorChange = (value) => {
        this.setState({
            idSetor: value
        })
        axios
        .get(this.props.backEndPoint + '/getSubprodutosPorProducaoSetor?idProducao='+this.state.idProducao+'&idSetor='+value)
        .then(res => {
            console.log('res.data.payload', res.data.payload)
            this.setState({
                subprodutosOptions: res.data.payload.map(subproduto => {
                    return({
                        value: subproduto.id,
                        description: subproduto.nome
                    })
                })
            })
        })
        .catch(error => {
            console.log(error)
        })
    }

    subprodutoChange = (value, e) => {
        this.setState({idSubproduto: value})
    }    

    selecionada = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if(!err){
                this.setState({mostrar: true})
            }
            else{
                console.log('erro no formulário')
            }
        })
    }

    barcodeTest = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if(!err){
                this.requestGetCodigoDeBarra(values.barcodeTeste)
                this.setState({mostrar: true})
            }
            else{
                console.log('erro no formulário')
            }
        })
    }

    handleSave = row => {
        let newData = [...this.state.tableData];
        let index = newData.findIndex(item => row.id === item.id);
        let item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        this.setState({ tableData: newData });
    }

    handleDelete = id => {
        let tableData = this.state.tableData
        let tableKeys = this.state.tableKeys
        tableData = tableData.filter(item => item.id !== id)
        tableKeys.splice(tableKeys.indexOf(id), 1)
        this.setState({tableData, tableKeys});
    }

    saveBarcodes = () => {
        let tableData = this.state.tableData;
        let requestData = tableData.map(record => {
            return {
                id: record.id,
                quantidade: record.quantidade
            }
        })
        this.requestDefeitosProducao(requestData)
    }

    alterarProducao = () => {
        this.setState({
            mostrar: false,
            idProducao: null,
            nomeProducao: null,
            tableData: [],
            tableKeys: []
        })
    }

    closeModal = () => {
        this.setState({
            mostrar: false,
            barcodeReader: false,
            idProducao: null,
            nomeProducao: null,
            tableData: [],
            tableKeys: []
        })
        this.props.showModalDefeitosProducaoF(false)
    }

    componentWillReceiveProps(nextProps){
        if(!this.props.showModalDefeitosProducao && nextProps.showModalDefeitosProducao){
            this.requestGetProducoesTitulo()
            this.requestGetSetoresTitulo()
            this.setState({barcodeReader: true})
        }
    }

    render(){
        const { getFieldDecorator } = this.props.form
        
        const components = {
            body: {
              row: EditableFormRow,
              cell: EditableCell,
            }
        };

        const columns = this.columns.map(col => {
            if (!col.editable) {
              return col;
            }
            return {
              ...col,
              onCell: record => ({
                record,
                editable: col.editable,
                dataIndex: col.dataIndex,
                title: col.title,
                errorMessage: col.errorMessage,
                handleSave: this.handleSave,
              }),
            };
          }); 

        return(
            <Modal
                title="Defeitos de Produção"
                visible={this.props.showModalDefeitosProducao}
                onCancel={this.closeModal}
                footer={[
                    <Button type="primary" key="back" onClick={this.closeModal}><Icon type="close" /> Fechar</Button>,
                ]}
                width={1200}
            >
                <Row>
                    <Col span={24} id="colDefeitosProducao" style={{position: 'relative'}}>
                        {
                            this.state.barcodeReader ?
                            <BarcodeReader
                                onError={this.handleError}
                                onScan={this.handleScanConferencia}
                            />
                            :null
                        }
                        {
                            !this.state.mostrar ?
                            <Form layout="vertical">
                                <Row gutter={10}>
                                    <Col span={6}>
                                        <Form.Item label="Produção">
                                            {getFieldDecorator('producao', {
                                                rules: [
                                                    {
                                                        required: true, message: 'Por favor selecione a produção',
                                                    }
                                                ]
                                            })(
                                                <Select
                                                    showSearch
                                                    optionFilterProp="children"
                                                    style={{ width: '100%' }}
                                                    placeholder="Selecione"
                                                    getPopupContainer={() => document.getElementById('colDefeitosProducao')}
                                                    allowClear={true}
                                                    onChange={this.producaoChange}
                                                >
                                                    {
                                                        this.state.producoesOptions.map((option) => {
                                                            return (<Select.Option key={option.value} value={option.value}>{option.description}</Select.Option>)
                                                        })
                                                    }
                                                </Select>
                                            )}
                                        </Form.Item>
                                        <Form.Item label="Setor">
                                            {getFieldDecorator('setor', {
                                                rules: [
                                                    {
                                                        required: true, message: 'Por favor selecione o setor',
                                                    }
                                                ]
                                            })(
                                                <Select
                                                    showSearch
                                                    optionFilterProp="children"
                                                    style={{ width: '100%' }}
                                                    placeholder="Selecione"
                                                    getPopupContainer={() => document.getElementById('colDefeitosProducao')}
                                                    allowClear={true}
                                                    onChange={this.setorChange}
                                                >
                                                    {
                                                        this.state.setoresOptions.map((option) => {
                                                            return (<Select.Option key={option.value} value={option.value}>{option.description}</Select.Option>)
                                                        })
                                                    }
                                                </Select>
                                            )}
                                        </Form.Item>
                                        <Form.Item label="Subproduto">
                                            {getFieldDecorator('subproduto', {
                                                rules: [
                                                    {
                                                        required: true, message: 'Por favor selecione o subproduto',
                                                    }
                                                ]
                                            })(
                                                <Select
                                                    showSearch
                                                    optionFilterProp="children"
                                                    style={{ width: '100%' }}
                                                    placeholder="Selecione"
                                                    getPopupContainer={() => document.getElementById('colDefeitosProducao')}
                                                    allowClear={true}
                                                    onChange={this.subprodutoChange}
                                                >
                                                    {
                                                        this.state.subprodutosOptions.map((option) => {
                                                            return (<Select.Option key={option.value} value={option.value}>{option.description}</Select.Option>)
                                                        })
                                                    }
                                                </Select>
                                            )}
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={6}>
                                        <Button className="buttonGreen" key="submit" onClick={() => this.selecionada()}><Icon type="check" /> Selecionar</Button>
                                    </Col>
                                </Row>
                            </Form>
                            :
                            <Row>
                                <Col span={24}>
                                    <span className="bold">Produção: {this.state.nomeProducao}</span>
                                    <span className="bold" onClick={this.alterarProducao} style={{marginLeft: 10, cursor: 'pointer', color: '#3c3fe0', textDecoration: 'underline'}}>Alterar</span>
                                </Col>
                                {
                                    this.state.tableData.length > 0 ?
                                    <Col span={24} style={{marginTop: '10px', textAlign: 'center'}}>
                                        <Button className="buttonGreen" onClick={() => this.saveBarcodes()}><Icon type="check" /> Salvar</Button>
                                    </Col>
                                    : null
                                }
                                {/* <Row>
                                    <Form layout="vertical">
                                        <Row>
                                            <Col span={14} id="colChaveNF" style={{position: 'relative'}}>                            
                                                <Form.Item
                                                    label="Codigo de Barras"
                                                >
                                                    {getFieldDecorator('barcodeTeste', {
                                                        rules: [
                                                            {
                                                                required: true, message: 'Por favor informe o barcode',
                                                            }
                                                        ]
                                                    })(
                                                        <Input
                                                            id="barcodeTeste"
                                                            placeholder="Digite o barcode"
                                                        />
                                                    )}
                                                </Form.Item>                              
                                            </Col> 
                                        </Row>
                                        <Row>
                                            <Button className="buttonGreen" key="submit" onClick={() => this.barcodeTest()}><Icon type="check" /> Selecionar</Button>
                                        </Row>
                                    </Form>
                                </Row> */}
                            </Row>
                            
                        }
                        <Divider />
                        {
                            this.state.tableData.length > 0 ?
                            <Table
                                components={components}
                                bordered
                                dataSource={this.state.tableData}
                                columns={columns}
                                rowKey='id'
                                pagination={false}
                            />
                            : null
                        }
                    </Col>
                </Row>
            </Modal>
        )
    }
}

const MapStateToProps = (state) => {
	return {
        backEndPoint: state.backEndPoint,
        producaoAcompanhamento: state.producaoAcompanhamento,
        producaoMainData: state.producaoMainData
	}
}

const mapDispatchToProps = (dispatch) => {
    return {}
}

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(withRouter(DefeitosProducao)))