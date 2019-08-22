import React, { Component } from 'react'
import { Icon, Modal, Button, Row, Col, Form, Input, Popconfirm, Table, notification } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"
import cloneDeep from 'lodash/cloneDeep';

let id = 0

class SaidaBarCode extends Component {
    constructor(props) {
        super()
        props.setPageTitle('Saída por Código de Barras')
    }

    state = {
        barcode: null,
        insumosData: [],
        tableLoading: false,
        btnSalvarLoading: false,
        btnSalvarDisabled: true,
        insumosRetirados: []
    }

    showNotification = (msg, success) => {
        var type = null
        var style = null
        if(success){
            type = 'check-circle'
            style = {color: '#4ac955', fontWeight: '800'}
        }
        else {
            type = 'exclamation-circle'
            style = {color: '#f5222d', fontWeight: '800'}
        }
        const args = {
            message: msg,
            icon:  <Icon type={type} style={style} />,
            duration: 3
        }
        notification.open(args)
    }

    returnInsumosArmazenagemByBarCode = () => {
        if(this.state.barcode){
            this.setState({tableLoading: true})
            let arrBarcode = this.state.barcode.split('-')
            this.loadInsumosData(arrBarcode)
        } else {
            this.showNotification('Não há insumo selecionado para a saída! Tente novamente', false)
        }      
    }

    loadInsumosData = (arrBarcode) => {
        axios
        .get(this.props.backEndPoint + '/getInsumosDisponiveisParaSaida?id_insumo='+arrBarcode[0]+'&id_almoxarifado='+arrBarcode[1]+'&id_posicao='+arrBarcode[2])
        .then(res => {
            if(res.data.payload){
                let btnSalvarDisabled = false;
                var insumosData = []
                res.data.payload.forEach(insumo => {
                    insumosData.push({
                        key: insumo.idArmazenagemInsumo,
                        idInsumo: insumo.idInsumo,
                        insumo: insumo.nomeInsumo,
                        ins: insumo.insInsumo,
                        idAlmoxarifado: insumo.idAlmoxarifado,
                        almoxarifado: insumo.nomeAlmoxarifado,
                        idPosicao: insumosData.idPosicao,
                        posicao: insumo.nomePosicao,
                        quantidade: insumo.quantidadeDisponivel
                    })
                })
                this.setState({insumosData, btnSalvarDisabled})                
            }
            else
                this.showNotification('Nenhum registo encontrado', false)          
            this.setState({tableLoading: false})
        })
        .catch(error => {
            console.log(error)
            this.setState({tableLoading: false})
            this.showNotification('Erro ao efetuar a operação! Tente novamente', false)
        })
    }

    handleOnChangeBarcode = (evt) => {
        this.setState({barcode: evt.target.value})
    }

    handleDeleteInsumo = (idInsumo) => {
        if(idInsumo){
            this.setState({tableLoading: true})
            let insumosData = this.state.insumosData.filter(insumoData => {
                return insumoData.key !== idInsumo
            })
            this.setState({tableLoading: false, insumosData: insumosData})
        }
    }

    componentDidUpdate(prevProps, prevState){    
        if(!prevProps.showSaidaBarCode && this.props.showSaidaBarCode){
            this.setState({
                barcode: null,
                insumosData: [],
                tableLoading: false,
                btnSalvarLoading: false,
                btnSalvarDisabled: true,
                insumosRetirados: []
            })
        }
    }

    handleAddInsumos = () => {
        if(this.state.insumosData && this.state.insumosData.length > 0){
            this.setState({btnSalvarLoading: true})
            this.props.insertSaidaInsumoF(this.state.insumosData)
        } else {
            this.showNotification('Sem insumos válidos para adicionar', false)
        }
    }

    render(){
        const columns = [{
            title: 'ID',
            dataIndex: 'idInsumo',
            key: 'idInsumo',
            align: 'center'
        },
        {
            title: 'Insumo',
            dataIndex: 'insumo',
            key: 'insumo'
        },
        {
            title: 'INS',
            dataIndex: 'ins',
            key: 'ins'
        },
        {
            title: 'Almoxarifado',
            dataIndex: 'almoxarifado',
            key: 'almoxarifado'
        },   
        {
            title: 'Posição',
            dataIndex: 'posicao',
            key: 'posicao'
        },              
        {
            title: 'Quantidade',
            dataIndex: 'quantidade',
            key: 'quantidade',
            align: 'center'
        },      
        {
            title: '',
            dataIndex: 'operacao',
            align: 'center',
            render: (text, record) => {
                return(
                    <React.Fragment>
                        <Popconfirm title="Confirmar remoção do insumo?" onConfirm={() => this.handleDeleteInsumo(record.key)}>
                            <a href="/admin/cadastros/pedidoscompra" title="Clique para remover da lista o insumo" style={{marginLeft: 20}}><Icon type="delete" style={{color: 'red'}} /></a>
                        </Popconfirm>
                    </React.Fragment>
                )
            }
        }]

        return(
            <React.Fragment>
                <Modal
                    title="Saída por Código de Barras"
                    visible={this.props.showSaidaBarCode}
                    onCancel={() => this.props.showSaidaBarCodeF(false)}
                    width={800}
                    footer={[
                        <Button key="back" onClick={() => this.props.showSaidaBarCodeF(false)}><Icon type="close" /> Fechar</Button>,
                        <Button key="button" type="primary" loading={this.state.btnSalvarLoading} onClick={() => this.handleAddInsumos()} disabled={this.state.btnSalvarDisabled}><Icon type="save" /> Adicionar Insumos</Button>
                    ]}
                >
                    <Row>
                        <Col span={24} id="colSaida" style={{position: 'relative'}}>
                            <Row>
                                <Col span={24}>
                                    <Input 
                                        id="barcode" 
                                        placeholder=""
                                        onChange={evt => this.handleOnChangeBarcode(evt)}
                                    />
                                    <Button 
                                        key="primary" 
                                        title="Novo Porcionamento" 
                                        onClick={() => this.returnInsumosArmazenagemByBarCode()}
                                    >
                                        <Icon type="plus" />
                                    </Button>
                                </Col>
                            </Row>
                            <Row>
                                <Table
                                    columns={columns}
                                    dataSource={this.state.insumosData}
                                    loading={this.state.tableLoading}
                                    pagination={false}
                                    rowKey='key'
                                />
                            </Row>
                        </Col>
                    </Row>
                </Modal>
            </React.Fragment>
        )
    }
}

const MapStateToProps = (state) => {
	return {
        backEndPoint: state.backEndPoint,
        session: state.session
	}
}

const mapDispatchToProps = (dispatch) => {
    return {
        setPageTitle: (pageTitle) => { dispatch({ type: 'SET_PAGETITLE', pageTitle }) }
    }
}

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(SaidaBarCode))