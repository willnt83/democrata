import React, { Component } from 'react'
import { Icon, Modal, Button, Row, Col, Form, Input, Popconfirm, Table, notification, Switch } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"
import BarcodeReader from 'react-barcode-reader'

class SaidaBarCode extends Component {
    constructor(props) {
        super()
        props.setPageTitle('Saída por Código de Barras')
        this.handleScanInsumosSaida = this.handleScanInsumosSaida.bind(this)
    }

    state = {
        barcodes: [],
        insumosData: [],
        tableLoading: false,
        btnSalvarLoading: false,
        btnSalvarDisabled: true,
        barcodeReader: true,
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

    handleError(err){
        console.error(err)
    }

    handleScanInsumosSaida(data){
        console.log(data)
        if(data){
            this.returnInsumosArmazenagemByBarCode(data)
        }
        else{
            this.showNotification('Erro na operação! Tente novamente', false)
        }
    }

    lancamentoManual = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if(!err){
                this.returnInsumosArmazenagemByBarCode(values.codigoDeBarras)
            }
        })
    }

    returnInsumosArmazenagemByBarCode = (barcode) => {
        if(barcode){            
            if(!this.state.barcodes.includes(barcode)){
                this.setState({tableLoading: true})
                this.loadInsumosData(barcode)
            } else {
                this.showNotification('Insumo já inserido na lista', false)
            }
        } else {
            this.showNotification('Não há insumo selecionado para a saída! Tente novamente', false)
        }      
    }

    loadInsumosData = (barcode) => {
        let arrBarcode = barcode.split('-')
        axios
        .get(this.props.backEndPoint + '/getInsumosDisponiveisParaSaida?id_insumo='+arrBarcode[0]+'&id_almoxarifado='+arrBarcode[1]+'&id_posicao='+arrBarcode[2])
        .then(res => {
            if(res.data.payload && res.data.payload.length > 0){
                let barcodes      = this.state.barcodes
                let insumosData   = this.state.insumosData
                let insumoPayload = res.data.payload[0]

                // Inserting data  
                let insumosInserted = this.props.returnInsumosInsertedF()                
                if( typeof insumosInserted === 'undefined' || 
                    (
                        typeof insumosInserted !== 'undefined' &&
                        insumosInserted && insumosInserted.length > 0 &&
                        !insumosInserted.includes(insumoPayload.idArmazenagemInsumo)
                    )
                ){                    
                    insumosData.push({
                        key: insumoPayload.idArmazenagemInsumo,
                        idInsumo: insumoPayload.idInsumo,
                        insumo: insumoPayload.nomeInsumo,
                        ins: insumoPayload.insInsumo,
                        idAlmoxarifado: insumoPayload.idAlmoxarifado,
                        almoxarifado: insumoPayload.nomeAlmoxarifado,
                        idPosicao: insumoPayload.idPosicao,
                        posicao: insumoPayload.nomePosicao,
                        quantidade: insumoPayload.quantidadeDisponivel
                    })
                    barcodes.push(barcode)
                } else {
                    this.showNotification('Insumo já inserido na saída')
                }

                this.setState({
                    barcodes: barcodes,
                    insumosData: insumosData,
                    btnSalvarDisabled: false
                })
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

    handleLancamentoManualChange = lancamentoManual => {
        this.setState({
            barcodeReader: lancamentoManual ? false : true
        })
    };
    
    verifyLancamentoManual = () => {
        return this.state.barcodeReader ? false : true
    }

    componentDidUpdate(prevProps, prevState){    
        if(!prevProps.showSaidaBarCode && this.props.showSaidaBarCode){
            this.setState({
                barcodes: [],
                insumosData: [],
                tableLoading: false,
                btnSalvarLoading: false,
                btnSalvarDisabled: true,
                barcodeReader: true,
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
        const { getFieldDecorator } = this.props.form

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
                                {
                                    this.state.barcodeReader ?
                                    (
                                        <BarcodeReader
                                            onError={this.handleError}
                                            onScan={this.handleScanInsumosSaida}/>
                                    )
                                    :
                                    (
                                        <Col span={24}>
                                            {/* <Input 
                                                id="barcode" 
                                                placeholder=""
                                                value={this.state.barcode}
                                                onChange={evt => this.handleOnChangeBarcode(evt)}
                                            />
                                            <Button 
                                                key="primary" 
                                                title="Novo Porcionamento" 
                                                onClick={() => this.returnInsumosArmazenagemByBarCode()}
                                            >
                                                <Icon type="plus" />
                                            </Button> */}
                                            <Form layout="vertical">
                                                <Form.Item           
                                                    label="Código de Barras"
                                                    style={{marginBottom: '2px'}}
                                                >
                                                    {getFieldDecorator('codigoDeBarras', {
                                                        rules: [
                                                            {
                                                                required: true, message: 'Por favor informe o código de barras',
                                                            }
                                                        ]
                                                    })(
                                                        <Input
                                                            id="nome"
                                                            placeholder="Digite o código de barras"
                                                        />
                                                    )}
                                                </Form.Item>
                                                <Form.Item style={{marginBottom: '2px'}}>
                                                    <Button key="submit" type="primary" onClick={this.lancamentoManual}><Icon type="save" /> Lançar</Button>
                                                </Form.Item>
                                            </Form>                                            
                                        </Col>
                                    )
                                }
                            </Row>
                            <Row>
                                <Col span={24} style={{textAlign: 'right'}}>
                                    Lançamento Manual: <Switch size="small" checked={!this.state.barcodeReader} onChange={this.handleLancamentoManualChange} />
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