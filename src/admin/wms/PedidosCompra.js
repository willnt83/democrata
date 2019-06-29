import React, { Component } from 'react'
import { Layout, Table, Icon, Popconfirm, Modal, Input, Button, Row, Col, Form, Select, Divider, DatePicker, TimePicker } from 'antd'
import { Tooltip } from '@material-ui/core/'
import { connect } from 'react-redux'
import axios from "axios"
import ptBr from 'antd/lib/locale-provider/pt_BR'
import moment from 'moment'
import 'moment/locale/pt-br'

import "./../static/form.css"

const { Content } = Layout

let id = 0

const statusPedidoOption = [
    {value: 'S', description: 'Solicitado'},
    {value: 'A', description: 'Em Andamento'},
    {value: 'F', description: 'Finalizado'}
]
const statusInsumoOption = [
    {value: 'S', description: 'Solicitado'},
    {value: 'E', description: 'Entregue'},
    {value: 'C', description: 'Conferido'}
]

class PedidosCompra extends Component {
    constructor(props) {
        super()
        props.setPageTitle('Pedidos de Compra')
    }

    state = {
        pedidoCompraId: null,
        tableData: [],
        showPedidosCompraModal: false,
        tableLoading: false,
        buttonSalvarPedidoCompra: false,
        insumosOptions: [],
        insValues: [],
        unidademedidaValues: [],
        fornecedoresOptions: [],       
        insumosSelectStatus: {
            placeholder: 'Carregando...',
            disabled: true
        },
        fornecedoresSelectStatus: {
            placeholder: 'Carregando...',
            disabled: true
        },        
        dynamicFieldsRendered: false,
        insumos: []
    }

    requestGetPedidosCompra = () => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/getPedidosCompra')
        .then(res => {
            if(res.data.payload){
                console.log('res.data.payload', res.data.payload)
                var tableData = res.data.payload.map(pedidocompra => {                    
                    return({
                        key: pedidocompra.id,
                        data_pedido: pedidocompra.data_pedido,
                        hora_pedido: pedidocompra.hora_pedido,
                        data_prevista: pedidocompra.data_prevista,
                        fornecedorValue: pedidocompra.idFornecedor,
                        fornecedorDescription: pedidocompra.nomeFornecedor,
                        statusValue: pedidocompra.status,
                        statusDescripton: this.returnStatusDescription(pedidocompra.status,statusPedidoOption),                        
                        insumos: pedidocompra.insumos
                    })
                })
                this.setState({tableData})
            }
            else
                console.log('Nenhum registro encontrado')
            this.setState({tableLoading: false})
        })
        .catch(error => {
            console.log(error)
            this.setState({tableLoading: false})
        })
    }

    loadFornecedoresOptions = () => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/getFornecedores?ativo=Y')
        .then(res => {
            if(res.data){                
                this.setState({
                    fornecedoresOptions: res.data.payload.map(fornecedor => {
                        return({
                            value: fornecedor.id,
                            description: fornecedor.nome,
                        })
                    }),
                    fornecedoresSelectStatus: {
                        placeholder: 'Selecione o fornecedor',
                        disabled: false
                    }
                })
            }
            else{
                console.log('Nenhum registro encontrado')
            }
            this.setState({tableLoading: false})
        })
        .catch(error => {
            console.log(error)
            this.setState({tableLoading: false})
        })
    }

    loadInsumosOptions = () => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/getInsumos?ativo=Y')
        .then(res => {
            if(res.data){                
                this.setState({                    
                    insumosOptions: res.data.payload.map(insumo => {
                        return({
                            value: insumo.id,
                            description: insumo.nome,
                            ins: insumo.ins,
                            unidademedida: insumo.nomeUnidadeMedida
                        })
                    }),
                    insumosSelectStatus: {
                        placeholder: 'Selecione o insumo',
                        disabled: false
                    }
                })
            }
            else{
                console.log('Nenhum registro encontrado')
            }
            this.setState({tableLoading: false})
        })
        .catch(error => {
            console.log(error)
            this.setState({tableLoading: false})
        })
    }

    requestCreateUpdatePedidoCompra = (request) => {
        this.setState({buttonSalvarPedidoCompra: true})
        axios.post(this.props.backEndPoint + '/createUpdateConjunto', request)
        .then(res => {
            this.showPedidosCompraModal(false)
            this.requestGetPedidosCompra()
            this.setState({buttonSalvarPedidoCompra: false})
        })
        .catch(error =>{
            console.log(error)
            this.setState({buttonSalvarPedidoCompra: false})
        })
    }

    showPedidosCompraModal = (showPedidosCompraModal) => {
        // Se estiver fechando
        if(!showPedidosCompraModal){
            this.props.form.resetFields()
            this.setState({pedidoCompraId: null})
        }
        this.setState({showPedidosCompraModal})
    }

    loadPedidoCompraModal = (record) => {
        this.loadInsumosOptions()        
        this.loadFornecedoresOptions()        
        if(typeof(record) !== "undefined") {
            // Edit
            // var keys = record.subprodutos.map((subproduto, index) => {
            //     return(index)
            // })

            this.props.form.setFieldsValue({
                fornecedor: record.fornecedorValue,
                ativo: record.ativoValue,
                setor: record.setorValue
            })

            this.setState({
                pedidoCompraId: record.key,
                dynamicFieldsRendered: true,
                // subprodutos: record.subprodutos
            })
        }
        else{
            this.props.form.setFieldsValue({
                data_pedido: moment(this.returnNowDate(), 'YYYY-MM-DD')
            })
            this.addComposicaoRow()
        }
        this.showPedidosCompraModal(true)
    }

    componentWillUpdate(){
        if(this.state.dynamicFieldsRendered){

            var subprodutos = this.state.subprodutos.map(subproduto => {
                return(subproduto.id)
            })
            var subprodutosQtde = this.state.subprodutos.map(subproduto => {
                return(subproduto.quantidade)
            })
            var subprodutosPontos = this.state.subprodutos.map(subproduto => {
                return(subproduto.pontos)
            })

            console.log('subprodutosPontos', subprodutosPontos)

            // Atualizando id, que é a variável que controla o add e remove de campos
            id = (this.state.subprodutos.length)

            this.props.form.setFieldsValue({
                subprodutos,
                subprodutosQtde,
                subprodutosPontos
            })

            this.setState({dynamicFieldsRendered: false})
        }
    }

    handleDeletePedidoCompra = (id) => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/deleteConjunto?id='+id)
        .then(res => {
            this.requestGetPedidosCompra()
        })
        .catch(error => {
            console.log(error)
        })
    }

    handleOnChange = (value, event, index) => {
        this.state.insValues[index] = event.props.ins;
        this.state.unidademedidaValues[index] = event.props.unidademedida;
    }

    returnStatusDescription = (status, object) => {
        var statusReturn = '';
        if(object){
            statusReturn = object.map(status => {
                if(status.value === status) return status.description
            });
        }
        return statusReturn;
    }

    compareByAlph = (a, b) => {
        if (a > b)
            return -1
        if (a < b)
            return 1
        return 0
    }

    returnNowDate = () => {
        var date = new Date();
        return date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()
    }

    addComposicaoRow = () => {
        const { form } = this.props
        const keys = form.getFieldValue('keys')
        const nextKeys = keys.concat(id++)

        form.setFieldsValue({
            keys: nextKeys,
        })

        this.state.insValues[(id-1)] = ''
        this.state.unidademedidaValues[(id-1)] = ''
    }

    removeComposicaoRow = (k) => {
        const { form } = this.props
        // can use data-binding to get
        const keys = form.getFieldValue('keys')
        // We need at least one passenger
        if (keys.length === 1){
            return
        }

        // can use data-binding to set
        form.setFieldsValue({
            keys: keys.filter(key => key !== k),
        })
    }

    handleFormSubmit = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err){
                var id = this.state.pedidoCompraId ? this.state.pedidoCompraId : null

                var subprodutos = null
                if(values.subprodutos){
                    subprodutos = values.subprodutos
                    .map((subproduto, index) => {
                        return ({
                            id: subproduto,
                            quantidade: parseInt(values.subprodutosQtde[index]),
                            pontos: parseFloat(values.subprodutosPontos[index])
                        })
                    })
                    .filter(subproduto => {
                        return subproduto !== null
                    })
                }

                var request = {
                    id: id,
                    nome: values.nome,
                    ativo: values.ativo,
                    setor: values.setor,
                    subprodutos: subprodutos
                }
                this.requestCreateUpdateConjunto(request)
            }
            else{
                console.log('erro no formulário')
            }
        })
    }

    componentWillMount(){
        this.requestGetPedidosCompra()
    }

    render(){
        const { getFieldDecorator, getFieldValue } = this.props.form
        getFieldDecorator('keys', { initialValue: [] })
        const keys = getFieldValue('keys')
        const composicaoItems = keys.map((k, index) => (
            <Row key={k} style={{marginBottom: '15px'}}>                
                <Col span={24}>
                    <Row gutter={3}>
                        <Col span={17} id="colInsumos" style={{position: 'relative'}}>
                            <Form.Item style={{paddingBottom: '0px', marginBottom: '0px'}}>
                                {getFieldDecorator(`insumos[${k}]`, {
                                    rules: [{
                                        required: true, message: "Informe o insumo"
                                    }],
                                })(
                                    <Select
                                        style={{ width: '100%' }}
                                        placeholder={this.state.insumosSelectStatus.placeholder}
                                        disabled={this.state.insumosSelectStatus.disabled}
                                        getPopupContainer={() => document.getElementById('colInsumos')}
                                        onSelect={(value, event) => this.handleOnChange(value, event, k)}
                                        allowClear={true}
                                    >
                                        {
                                            this.state.insumosOptions.map((option) => {
                                                return (<Select.Option key={option.value} value={option.value} ins={option.ins} unidademedida={option.unidademedida}>{option.description}</Select.Option>)
                                            })
                                        }
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={6} id="colQtde" style={{position: 'relative'}}>
                            <Form.Item style={{paddingBottom: '0px', marginBottom: '0px'}}>
                                {getFieldDecorator(`quantidades[${k}]`, {
                                    rules: [
                                        {
                                            required: true, message: 'Informe a quantidade',
                                        }
                                    ]
                                })(
                                    <Input
                                        id="quantidade"
                                        placeholder="Quantidade"
                                    />
                                )}
                            </Form.Item>
                        </Col> 
                        <Col span={1} id="colDelete" style={{position: 'relative'}}>
                            <Form.Item style={{paddingBottom: '0px', marginBottom: '0px', marginTop: '4px', textAlign: 'center'}}>
                                {keys.length > 1 ? (
                                    <Icon
                                        className="dynamic-delete-button"
                                        type="minus-circle-o"
                                        disabled={keys.length === 1}
                                        onClick={() => this.removeComposicaoRow(k)}
                                    />
                                ) : null}
                            </Form.Item>
                        </Col>  
                    </Row>
                    <Row gutter={3} style={{marginLeft: '1px'}}>
                        <Col span={7} id="colINS" style={{position: 'relative'}}>
                            <div style={{fontSize: '12px'}} dangerouslySetInnerHTML={{__html: '<span><strong>INS:</strong> '+this.state.insValues[k]+'</span>'}}></div>
                        </Col>
                        <Col span={17} id="colUnidadeMedida" style={{position: 'relative'}}>
                            <div style={{fontSize: '12px'}} dangerouslySetInnerHTML={{__html: '<span><strong>Unidade de Medida:</strong> '+this.state.unidademedidaValues[k]+'</span>'}}></div>
                        </Col>
                    </Row>
                </Col>             
            </Row>
        ))

        const columns = [{
            title: 'ID',
            dataIndex: 'key',
            sorter: (a, b) => a.key - b.key,
        },
        {
            title: 'Data Pedido',
            dataIndex: 'data_pedido',
            align: 'center',
            sorter: (a, b) => this.compareByAlph(a.data_pedido, b.data_pedido)
        },
        {
            title: 'Hora Pedido',
            dataIndex: 'hora_pedido',
            align: 'center',
            sorter: (a, b) => this.compareByAlph(a.hora_pedido, b.hora_pedido)
        },        
        {
            title: 'Fornecedor',
            dataIndex: 'fornecedorDescription',
            align: 'center',
            sorter: (a, b) => this.compareByAlph(a.fornecedorDescription, b.fornecedorDescription)
        }, 
        {
            title: 'Previsão',
            dataIndex: 'data_prevista',
            align: 'center',
            sorter: (a, b) => this.compareByAlph(a.data_prevista, b.data_prevista)
        },                
        {
            title: 'Status',
            dataIndex: 'statusDescription',
            align: 'center',
            sorter: (a, b) => this.compareByAlph(a.statusDescription, b.statusDescription)
        }, 
        {
            title: 'Operação',
            colSpan: 2,
            dataIndex: 'operacao',
            align: 'center',
            width: 150,
            render: (text, record) => {
                return(
                    <React.Fragment>
                        <Icon type="edit" style={{cursor: 'pointer'}} onClick={() => this.loadPedidoCompraModal(record)} />
                        <Popconfirm title="Confirmar remoção?" onConfirm={() => this.handleDeleteConjunto(record.key)}>
                            <a href="/admin/cadastros/pedidoscompra" style={{marginLeft: 20}}><Icon type="delete" style={{color: 'red'}} /></a>
                        </Popconfirm>
                    </React.Fragment>
                )
            }
        }]

        return(
            <Content
                style={{
                    margin: "24px 16px",
                    padding: 24,
                    background: "#fff",
                    minHeight: 280
                }}
            >
                <Row style={{ marginBottom: 16 }}>
                    <Col span={24} align="end">
                        <Tooltip title="Cadastrar Novo Pedido de Compra" placement="right">
                            <Button className="buttonGreen" onClick={() => this.loadPedidoCompraModal()}><Icon type="plus" /> Novo Pedido Compra</Button>
                        </Tooltip>
                    </Col>
                </Row>
                
                <Table
                    columns={columns}
                    dataSource={this.state.tableData}
                    loading={this.state.tableLoading}
                />
                <Modal
                    title="Cadastro de Pedido de Compra"
                    visible={this.state.showPedidosCompraModal}
                    onCancel={() => this.showPedidosCompraModal(false)}
                    footer={[
                        <Button key="back" onClick={() => this.showPedidosCompraModal(false)}><Icon type="close" /> Cancelar</Button>,
                        <Button key="submit" type="primary" loading={this.state.buttonSalvarPedidoCompra} onClick={() => this.handleFormSubmit()}><Icon type="save" /> Salvar</Button>
                    ]}
                    width={900}
                >
                    <Form layout="vertical">                        
                        <Row gutter={3}>
                            <Col span={14} id="colFornecedor" style={{position: 'relative'}}>
                                <Form.Item
                                    label="Fornecedor"
                                >
                                    {getFieldDecorator('fornecedor', {
                                        rules: [{
                                            required: true, message: "Informe o fornecedor"
                                        }],
                                    })(
                                        <Select
                                            style={{ width: '100%' }}
                                            placeholder={this.state.fornecedoresSelectStatus.placeholder}
                                            disabled={this.state.fornecedoresSelectStatus.disabled}
                                            getPopupContainer={() => document.getElementById('fornecedor')}
                                            allowClear={true}
                                        >
                                            {
                                                this.state.fornecedoresOptions.map((option) => {
                                                    return (<Select.Option key={option.value} value={option.value}>{option.description}</Select.Option>)
                                                })
                                            }
                                        </Select>
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={10} id="colDataEntrega" style={{position: 'relative'}}>
                                <Form.Item
                                    label="Data Prevista de Entrega"
                                >
                                    {getFieldDecorator('data_entrega', {
                                        rules: [
                                            {
                                                required: true, message: 'Por favor informe a data prevista de entrega',
                                            }
                                        ]
                                    })(
                                        <DatePicker
                                            locale={ptBr}
                                            format="DD/MM/YYYY"
                                            placeholder="Selecione a data"
                                            style={ {width: '100%'} }
                                            getCalendarContainer={() => document.getElementById('colDataEntrega')}
                                        />
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={2}>   
                            <Col span={14} id="colChaveNF" style={{position: 'relative'}}>                            
                                <Form.Item
                                    label="Chave da Nota Fiscal"
                                >
                                    {getFieldDecorator('chave_nf', {
                                        rules: [
                                            {
                                                required: true, message: 'Por favor informe a chave da nota fiscal',
                                            }
                                        ]
                                    })(
                                        <Input
                                            id="chave_nf"
                                            placeholder="Digite a chave da nota fiscal"
                                        />
                                    )}
                                </Form.Item>                              
                            </Col>                                                      
                            <Col span={5} id="colDataPedido" style={{position: 'relative'}}>
                                <Form.Item
                                    label="Data do Pedido"
                                >
                                    {getFieldDecorator('data_pedido', {
                                        rules: [
                                            {
                                                required: true, message: 'Por favor informe a data do pedido',
                                            }
                                        ]
                                    })(
                                        <DatePicker
                                            locale={ptBr}
                                            format="DD/MM/YYYY"
                                            placeholder="Selecione a data"
                                            style={ {width: '100%'} }
                                            getCalendarContainer={() => document.getElementById('colDataPedido')}
                                            disabled
                                        />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={5} id="colHoraPredido" style={{position: 'relative'}}>
                                <Form.Item
                                    label="Data do Pedido"
                                >
                                    {getFieldDecorator('hora_pedido', {
                                        rules: [
                                            {
                                                required: true, message: 'Por favor informe a data do pedido',
                                            }
                                        ]
                                    })(
                                        <TimePicker
                                            locale={ptBr}
                                            format="DD/MM/YYYY"
                                            placeholder="Selecione a data"
                                            style={ {width: '100%'} }
                                            getCalendarContainer={() => document.getElementById('colHoraPredido')}
                                            disabled
                                        />
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>
                        <Divider />
                        <h4>Insumos (Matérias Primas)</h4>  
                        {composicaoItems}
                        <Row>
                            <Col span={24}>
                                <Button key="primary" title="Incluir insumo" onClick={this.addComposicaoRow}><Icon type="plus" /></Button>
                            </Col>
                        </Row>                        
                    </Form>
                </Modal>
          </Content>
        )
    }
}

const MapStateToProps = (state) => {
	return {
        backEndPoint: state.backEndPoint
	}
}

const mapDispatchToProps = (dispatch) => {
    return {
        setPageTitle: (pageTitle) => { dispatch({ type: 'SET_PAGETITLE', pageTitle }) }
    }
}

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(PedidosCompra))