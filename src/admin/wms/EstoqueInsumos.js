import React, { Component } from 'react'
import { Layout, Table, Icon, Popconfirm, Input, Button, Row, Col, Form, Select, Divider } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"

const { Content } = Layout

class EstoqueInsumos extends Component {
    constructor(props) {
        super()
        props.setPageTitle('Consulta de Estoque de Insumos')
    }

    state = {
        tableData: [],
        tableLoading: false,
        almoxarifadosOptions: [],
        posicoesOptions: [],
        almoxarifadoSelectStatus: {
            placeholder: 'Carregando...',
            disabled: true
        },
        posicaoSelectStatus: {
            placeholder: 'Selecione o almoxarifado',
            disabled: true
        }
    }

    compareByAlph = (a, b) => {
        if (a > b)
            return -1
        if (a < b)
            return 1
        return 0
    }

    getAlmoxarifados = () => {
        axios
        .get(this.props.backEndPoint + '/getAlmoxarifados?ativo=Y')
        .then(res => {
            if(res.data.payload){
                this.setState({
                    almoxarifadosOptions: res.data.payload
                })
            }
            else{
                console.log('Nenhum registro encontrado')
            }
            this.setState({
                almoxarifadoSelectStatus: {
                    placeholder: '',
                    disabled: false
                }
            })
        })
        .catch(error => {
            console.log(error)
        })
    }

    getPosicoesArmazem = (idAlmoxarifado) => {
        axios
        .get(this.props.backEndPoint + '/getPosicaoArmazens?id_almoxarifado='+idAlmoxarifado+'&ativo=Y')
        .then(res => {
            if(res.data.payload){
                this.setState({posicoesOptions: res.data.payload})
            }
            else{
                console.log('Nenhum registro encontrado')
            }
            this.setState({
                posicaoSelectStatus: {
                    placeholder: '',
                    disabled: false
                }
            })
        })
        .catch(error => {
            console.log(error)
        })
    }

    changeAlmoxarifado = (value) => {
        this.props.form.setFieldsValue({posicao: null})

        this.setState({
            posicoesOptions: [],
            posicaoSelectStatus: {
                placeholder: 'Carregando...',
                disabled: true
            }
        })
        this.getPosicoesArmazem(value)
    }

    requestGetInsumos = () => {
        this.setState({tableLoading: true})
        this.props.form.validateFieldsAndScroll((err, values) => {
            
            var filtros = ''
            var first = true
            var and = null
            if(values.descricao){
                and = first ? '?' : '&'
                filtros += and+'nome='+values.descricao
                first = false
            }
            if(values.ins){
                and = first ? '?' : '&'
                filtros += and+'ins='+values.ins
                first = false
            }
            if(values.almoxarifado){
                and = first ? '?' : '&'
                filtros += and+'id_almoxarifado='+values.almoxarifado
                first = false
            }
            if(values.posicao){
                and = first ? '?' : '&'
                filtros += and+'id_posicao='+values.posicao
                first = false
            }
            console.log('filtros: '+filtros)
            
        
        
            axios
            .get(this.props.backEndPoint + '/getEstoqueDeInsumos'+filtros)
            .then(res => {
                if(res.data.payload){
                    this.setState({tableData: res.data.payload})
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

        })
    }

    componentWillUpdate(){
        if(this.state.dynamicFieldsRendered){
            this.setState({dynamicFieldsRendered: false})
        }
    }

    componentWillMount(){
        this.getAlmoxarifados()
    }

    render(){
        const { getFieldDecorator } = this.props.form
        const columns = [
            {
                title: 'ID',
                dataIndex: 'idInsumo',
                sorter: (a, b) => a.idInsumo - b.idInsumo,
            },
            {
                title: 'Descrição',
                dataIndex: 'nomeInsumo',
                sorter: (a, b) => this.compareByAlph(a.nomeInsumo, b.nomeInsumo)
            },
            {
                title: 'INS',
                dataIndex: 'insInsumo',
                sorter: (a, b) => this.compareByAlph(a.insInsumo, b.insInsumo)
            },
            {
                title: 'Unidade de Medida',
                dataIndex: 'unidadeMedidaInsumo',
                sorter: (a, b) => this.compareByAlph(a.unidadeMedidaInsumo, b.unidadeMedidaInsumo)
            },
            {
                title: 'Almoxarifado',
                dataIndex: 'nomeAlmoxarifado',
                align: 'center',
                sorter: (a, b) => this.compareByAlph(a.nomeAlmoxarifado, b.nomeAlmoxarifado)
            },
            {
                title: 'Posição',
                dataIndex: 'nomePosicao',
                align: 'center',
                sorter: (a, b) => this.compareByAlph(a.nomePosicao, b.nomePosicao)
            },
            {
                title: 'Quantidade',
                dataIndex: 'quantidade',
                sorter: (a, b) => a.quantidade - b.quantidade,
            }
        ]

        return(
            <Content
                style={{
                    margin: "24px 16px",
                    padding: 24,
                    background: "#fff",
                    minHeight: 280
                }}
            >
                <h3>Filtros</h3>
                <Form layout="vertical">
                    <Row gutter={6}>
                        <Col span={5}>
                            
                                <Form.Item
                                    label="Descrição"
                                >
                                    {getFieldDecorator('descricao')(
                                        <Input
                                            id="descricao"
                                            placeholder="Buscar por descrição"
                                        />
                                    )}
                                </Form.Item>
                        </Col>
                        <Col span={5}>
                                <Form.Item
                                    label="INS"
                                >
                                    {getFieldDecorator('ins')(
                                        <Input
                                            id="ins"
                                            placeholder="Buscar por INS"
                                        />
                                    )}
                                </Form.Item>
                            
                        </Col>
                    </Row>
                    <Row gutter={6}>
                        <Col span={5} id="almoxarifado" style={{position: 'relative'}}>
                            <Form.Item label="Almoxarifado" style={{marginBottom: 0}}>
                                {getFieldDecorator('almoxarifado')(
                                    <Select
                                        showSearch
                                        optionFilterProp="children"
                                        style={{ width: '100%' }}
                                        getPopupContainer={() => document.getElementById('almoxarifado')}
                                        allowClear={true}
                                        placeholder={this.state.almoxarifadoSelectStatus.placeholder}
                                        disabled={this.state.almoxarifadoSelectStatus.disabled}
                                        onChange={(value) => this.changeAlmoxarifado(value)}
                                    >
                                        {
                                            this.state.almoxarifadosOptions.map((option) => {
                                                return (<Select.Option key={option.id} value={option.id}>{option.nome}</Select.Option>)
                                            })
                                        }
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={5} id="posicao" style={{position: 'relative'}}>
                            <Form.Item label="Posição" style={{marginBottom: 0}}>
                                {getFieldDecorator('posicao')(
                                    <Select
                                        showSearch
                                        optionFilterProp="children"
                                        style={{ width: '100%' }}
                                        getPopupContainer={() => document.getElementById('posicao')}
                                        allowClear={true}
                                        placeholder={this.state.posicaoSelectStatus.placeholder}
                                        disabled={this.state.posicaoSelectStatus.disabled}
                                    >
                                        {
                                            this.state.posicoesOptions.map(option => {
                                                return(
                                                    <Select.Option key={option.id} value={option.id}>{option.posicao}</Select.Option>
                                                )
                                            })
                                        }
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row style={{marginTop: 20}}>
                        <Col span={5}>
                            <Button className="buttonGreen" key="back" onClick={() => this.requestGetInsumos()}><Icon type="search" /> Buscar</Button>
                        </Col>
                    </Row>
                </Form>
                <Divider />
                
                <Table
                    columns={columns}
                    dataSource={this.state.tableData}
                    loading={this.state.tableLoading}
                />
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

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(EstoqueInsumos))